import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { calculateTax } from "@shared/taxEngine";
import { categorizeTransaction, calculateFinancialHealthScore, calculateSafeToSpendDaily, getDaysRemainingInMonth } from "@shared/formatting";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Financial Profile
  profile: router({
    getOrCreate: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrCreateFinancialProfile(ctx.user.id);
    }),
    update: protectedProcedure.input(z.object({
      totalBalance: z.number().optional(),
      monthlyIncome: z.number().optional(),
      monthlySavingsGoal: z.number().optional(),
      currentMonthlySavings: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const updateData: any = { ...input };
      if (input.monthlyIncome && input.currentMonthlySavings) {
        updateData.financialHealthScore = calculateFinancialHealthScore(input.monthlyIncome, input.currentMonthlySavings);
      }
      const updated = await db.updateFinancialProfile(ctx.user.id, updateData);
      return updated;
    }),
  }),

  // Transactions
  transactions: router({
    list: protectedProcedure.input(z.object({
      limit: z.number().optional().default(50),
    })).query(async ({ ctx, input }) => {
      return db.getUserTransactions(ctx.user.id, input.limit);
    }),
    create: protectedProcedure.input(z.object({
      amount: z.number().positive(),
      description: z.string(),
      transactionType: z.enum(["debit", "credit"]),
      source: z.enum(["UPI", "Bank SMS", "Manual"]).optional(),
      transactionDate: z.date().optional(),
    })).mutation(async ({ ctx, input }) => {
      const category = categorizeTransaction(input.description);
      const txData: any = {
        userId: ctx.user.id,
        amount: input.amount.toString(),
        category,
        description: input.description,
        transactionType: input.transactionType,
        source: input.source || "Manual",
        transactionDate: input.transactionDate || new Date(),
      };
      return db.createTransaction(txData);
    }),
    categorizeWithAI: protectedProcedure.input(z.object({
      description: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a financial transaction categorizer for Indian users. Categorize the following transaction into one of these categories: Needs (essentials like rent, groceries), Wants (discretionary like dining, shopping), Investments (SIPs, PPF, stocks), or Income. Respond with ONLY the category name.`,
          },
          {
            role: "user",
            content: input.description,
          },
        ],
      });
      
      const categoryContent = response.choices[0]?.message.content;
      const category = typeof categoryContent === 'string' ? categoryContent.trim() : "Uncategorized";
      return { category };
    }),
  }),

  // Savings Goals
  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSavingsGoals(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({
      goalName: z.string(),
      targetAmount: z.number().positive(),
      goalType: z.enum(["Emergency Fund", "Vacation", "Home", "Vehicle", "Education", "Retirement", "Other"]).optional(),
      deadline: z.date().optional(),
    })).mutation(async ({ ctx, input }) => {
      const goalData: any = {
        userId: ctx.user.id,
        goalName: input.goalName,
        targetAmount: input.targetAmount.toString(),
        deadline: input.deadline,
      };
      if (input.goalType) goalData.goalType = input.goalType;
      return db.createSavingsGoal(goalData);
    }),
    update: protectedProcedure.input(z.object({
      goalId: z.number(),
      currentAmount: z.number().optional(),
      targetAmount: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const updateData: any = {};
      if (input.currentAmount !== undefined) updateData.currentAmount = input.currentAmount.toString();
      if (input.targetAmount !== undefined) updateData.targetAmount = input.targetAmount.toString();
      return db.updateSavingsGoal(input.goalId, updateData);
    }),
  }),

  // Nudges
  nudges: router({
    list: protectedProcedure.input(z.object({
      limit: z.number().optional().default(20),
    })).query(async ({ ctx, input }) => {
      return db.getUserNudges(ctx.user.id, input.limit);
    }),
    markAsRead: protectedProcedure.input(z.object({
      nudgeId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      return db.markNudgeAsRead(input.nudgeId);
    }),
    generate: protectedProcedure.input(z.object({
      monthlyIncome: z.number(),
      currentMonthlySavings: z.number(),
      monthlySavingsGoal: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a financial nudge generator for Indian users. Generate a helpful, encouraging nudge based on their savings data. Keep it concise (1-2 sentences). Format: "[Type]: [Message]" where Type is one of: Savings Goal, Liquid Fund, Festive Spending, Spending Pattern, Investment Opportunity.`,
          },
          {
            role: "user",
            content: `Monthly Income: ₹${input.monthlyIncome}, Current Savings: ₹${input.currentMonthlySavings}, Savings Goal: ₹${input.monthlySavingsGoal}`,
          },
        ],
      });
      
      const content = typeof response.choices[0]?.message.content === 'string' 
        ? response.choices[0].message.content 
        : "Keep up your savings momentum!";
      const parts = content.split(":");
      const typeStr = parts[0]?.trim() || "Savings Goal";
      const message = parts[1]?.trim() || content;
      
      return db.createNudge({
        userId: ctx.user.id,
        nudgeType: typeStr as any,
        title: typeStr || "Savings Nudge",
        content: message || content,
        festiveContext: "None" as any,
      });
    }),
  }),

  // Consent Preferences
  consent: router({
    getOrCreate: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrCreateConsentPreferences(ctx.user.id);
    }),
    update: protectedProcedure.input(z.object({
      dataCollection: z.boolean().optional(),
      transactionAnalysis: z.boolean().optional(),
      aiCoachInsights: z.boolean().optional(),
      nudgeGeneration: z.boolean().optional(),
      taxAnalysis: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const consentData: any = {};
      if (input.dataCollection !== undefined) consentData.dataCollection = input.dataCollection;
      if (input.transactionAnalysis !== undefined) consentData.transactionAnalysis = input.transactionAnalysis;
      if (input.aiCoachInsights !== undefined) consentData.aiCoachInsights = input.aiCoachInsights;
      if (input.nudgeGeneration !== undefined) consentData.nudgeGeneration = input.nudgeGeneration;
      if (input.taxAnalysis !== undefined) consentData.taxAnalysis = input.taxAnalysis;
      return db.updateConsentPreferences(ctx.user.id, consentData);
    }),
  }),

  // AI Coach Chat
  coach: router({
    chat: protectedProcedure.input(z.object({
      message: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const transactions = await db.getUserTransactions(ctx.user.id, 20);
      const profile = await db.getOrCreateFinancialProfile(ctx.user.id);
      
      const context = `User's financial context: Monthly Income: ₹${profile?.monthlyIncome || 0}, Total Balance: ₹${profile?.totalBalance || 0}. Recent transactions: ${transactions.slice(0, 5).map((t: any) => `${t.description} (${t.category}): ₹${t.amount}`).join(", ")}`;
      
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are Bharat Finance Mitra, a friendly and knowledgeable AI financial coach for Indian users. Provide helpful, personalized financial advice based on their spending patterns and goals. Be encouraging and practical. ${context}`,
          },
          {
            role: "user",
            content: input.message,
          },
        ],
      });
      
      const aiResponse = typeof response.choices[0]?.message.content === 'string' 
        ? response.choices[0].message.content 
        : "I'm here to help with your finances!";
      
      const chatData: any = {
        userId: ctx.user.id,
        userMessage: input.message,
        aiResponse: aiResponse as string,
      };
      if (profile) chatData.context = { profile, recentTransactions: transactions.length };
      await db.createChatMessage(chatData);
      
      return { response: aiResponse };
    }),
    history: protectedProcedure.input(z.object({
      limit: z.number().optional().default(50),
    })).query(async ({ ctx, input }) => {
      return db.getUserChatHistory(ctx.user.id, input.limit);
    }),
  }),

  // Tax Engine
  tax: router({
    calculate: protectedProcedure.input(z.object({
      annualIncome: z.number().positive(),
      npsContribution: z.number().optional().default(0),
      otherDeductions: z.number().optional().default(0),
      age: z.number().optional().default(30),
    })).mutation(async ({ ctx, input }) => {
      const result = calculateTax(input);
      
      const taxData: any = {
        userId: ctx.user.id,
        annualIncome: input.annualIncome.toString(),
        recommendedRegime: result.recommendedRegime,
        newRegimeTax: result.newRegimeTax.toString(),
        oldRegimeTax: result.oldRegimeTax.toString(),
        npsContribution: input.npsContribution.toString(),
        standardDeduction: result.standardDeduction.toString(),
        savings: result.savings.toString(),
      };
      await db.createTaxAnalysis(taxData);
      
      return result;
    }),
    latest: protectedProcedure.query(async ({ ctx }) => {
      return db.getLatestTaxAnalysis(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
