import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Financial profile for each user
 */
export const financialProfiles = mysqlTable("financial_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  totalBalance: decimal("total_balance", { precision: 15, scale: 2 }).default("0"),
  monthlyIncome: decimal("monthly_income", { precision: 15, scale: 2 }).default("0"),
  monthlySavingsGoal: decimal("monthly_savings_goal", { precision: 15, scale: 2 }).default("0"),
  currentMonthlySavings: decimal("current_monthly_savings", { precision: 15, scale: 2 }).default("0"),
  financialHealthScore: int("financial_health_score").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialProfile = typeof financialProfiles.$inferSelect;
export type InsertFinancialProfile = typeof financialProfiles.$inferInsert;

/**
 * Transactions imported from bank SMS or UPI
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  category: mysqlEnum("category", ["Needs", "Wants", "Investments", "Income", "Uncategorized"]).default("Uncategorized"),
  description: text("description"),
  transactionType: mysqlEnum("transaction_type", ["debit", "credit"]).notNull(),
  source: mysqlEnum("source", ["UPI", "Bank SMS", "Manual"]).default("Manual"),
  transactionDate: timestamp("transaction_date").notNull(),
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Savings goals and milestones
 */
export const savingsGoals = mysqlTable("savings_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).default("0"),
  deadline: timestamp("deadline"),
  goalType: mysqlEnum("goal_type", ["Emergency Fund", "Vacation", "Home", "Vehicle", "Education", "Retirement", "Other"]).default("Other"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;

/**
 * AI-generated nudges for users
 */
export const nudges = mysqlTable("nudges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  nudgeType: mysqlEnum("nudge_type", ["Savings Goal", "Liquid Fund", "Festive Spending", "Spending Pattern", "Investment Opportunity"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  actionUrl: varchar("action_url", { length: 512 }),
  isRead: boolean("is_read").default(false),
  festiveContext: mysqlEnum("festive_context", ["Diwali", "Wedding Season", "None"]).default("None"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export type Nudge = typeof nudges.$inferSelect;
export type InsertNudge = typeof nudges.$inferInsert;

/**
 * DPDP Act 2023 consent preferences
 */
export const consentPreferences = mysqlTable("consent_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  dataCollection: boolean("data_collection").default(false),
  transactionAnalysis: boolean("transaction_analysis").default(false),
  aiCoachInsights: boolean("ai_coach_insights").default(false),
  nudgeGeneration: boolean("nudge_generation").default(false),
  taxAnalysis: boolean("tax_analysis").default(false),
  consentTimestamp: timestamp("consent_timestamp").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConsentPreferences = typeof consentPreferences.$inferSelect;
export type InsertConsentPreferences = typeof consentPreferences.$inferInsert;

/**
 * AI Coach chat history
 */
export const chatHistory = mysqlTable("chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  context: json("context"), // Store relevant financial context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;

/**
 * Tax analysis results for 2025-26
 */
export const taxAnalysis = mysqlTable("tax_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  annualIncome: decimal("annual_income", { precision: 15, scale: 2 }).notNull(),
  recommendedRegime: mysqlEnum("recommended_regime", ["New", "Old"]).notNull(),
  newRegimeTax: decimal("new_regime_tax", { precision: 15, scale: 2 }).notNull(),
  oldRegimeTax: decimal("old_regime_tax", { precision: 15, scale: 2 }).notNull(),
  npsContribution: decimal("nps_contribution", { precision: 15, scale: 2 }).default("0"),
  standardDeduction: decimal("standard_deduction", { precision: 15, scale: 2 }).notNull(),
  savings: decimal("savings", { precision: 15, scale: 2 }).notNull(),
  analysisDate: timestamp("analysis_date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaxAnalysis = typeof taxAnalysis.$inferSelect;
export type InsertTaxAnalysis = typeof taxAnalysis.$inferInsert;
