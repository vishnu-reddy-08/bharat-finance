import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  financialProfiles,
  transactions,
  savingsGoals,
  nudges,
  consentPreferences,
  chatHistory,
  taxAnalysis
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Financial Profile queries
export async function getOrCreateFinancialProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(financialProfiles).where(eq(financialProfiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(financialProfiles).values({ userId });
  const created = await db.select().from(financialProfiles).where(eq(financialProfiles.userId, userId)).limit(1);
  return created[0] || null;
}

export async function updateFinancialProfile(userId: number, data: Partial<typeof financialProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(financialProfiles).set(data).where(eq(financialProfiles.userId, userId));
  const updated = await db.select().from(financialProfiles).where(eq(financialProfiles.userId, userId)).limit(1);
  return updated[0] || null;
}

// Transaction queries
export async function createTransaction(data: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(transactions).values(data);
  const created = await db.select().from(transactions).orderBy(desc(transactions.id)).limit(1);
  return created[0] || null;
}

export async function getUserTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.transactionDate)).limit(limit);
}

export async function getTransactionsByCategory(userId: number, category: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.category, category as any)));
}

// Savings Goal queries
export async function createSavingsGoal(data: typeof savingsGoals.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(savingsGoals).values(data);
  const created = await db.select().from(savingsGoals).orderBy(desc(savingsGoals.id)).limit(1);
  return created[0] || null;
}

export async function getUserSavingsGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId)).orderBy(desc(savingsGoals.createdAt));
}

export async function updateSavingsGoal(goalId: number, data: Partial<typeof savingsGoals.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(savingsGoals).set(data).where(eq(savingsGoals.id, goalId));
  const updated = await db.select().from(savingsGoals).where(eq(savingsGoals.id, goalId)).limit(1);
  return updated[0] || null;
}

// Nudge queries
export async function createNudge(data: typeof nudges.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(nudges).values(data);
  const created = await db.select().from(nudges).orderBy(desc(nudges.id)).limit(1);
  return created[0] || null;
}

export async function getUserNudges(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(nudges).where(eq(nudges.userId, userId)).orderBy(desc(nudges.createdAt)).limit(limit);
}

export async function markNudgeAsRead(nudgeId: number) {
  const db = await getDb();
  if (!db) return null;

  await db.update(nudges).set({ isRead: true }).where(eq(nudges.id, nudgeId));
  const updated = await db.select().from(nudges).where(eq(nudges.id, nudgeId)).limit(1);
  return updated[0] || null;
}

// Consent Preferences queries
export async function getOrCreateConsentPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(consentPreferences).where(eq(consentPreferences.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(consentPreferences).values({ userId });
  const created = await db.select().from(consentPreferences).where(eq(consentPreferences.userId, userId)).limit(1);
  return created[0] || null;
}

export async function updateConsentPreferences(userId: number, data: Partial<typeof consentPreferences.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(consentPreferences).set(data).where(eq(consentPreferences.userId, userId));
  const updated = await db.select().from(consentPreferences).where(eq(consentPreferences.userId, userId)).limit(1);
  return updated[0] || null;
}

// Chat History queries
export async function createChatMessage(data: typeof chatHistory.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(chatHistory).values(data);
  const created = await db.select().from(chatHistory).orderBy(desc(chatHistory.id)).limit(1);
  return created[0] || null;
}

export async function getUserChatHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(chatHistory).where(eq(chatHistory.userId, userId)).orderBy(desc(chatHistory.createdAt)).limit(limit);
}

// Tax Analysis queries
export async function createTaxAnalysis(data: typeof taxAnalysis.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(taxAnalysis).values(data);
  const created = await db.select().from(taxAnalysis).orderBy(desc(taxAnalysis.id)).limit(1);
  return created[0] || null;
}

export async function getLatestTaxAnalysis(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(taxAnalysis).where(eq(taxAnalysis.userId, userId)).orderBy(desc(taxAnalysis.createdAt)).limit(1);
  return result[0] || null;
}
