import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tokens, badges, leaderboard } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const tokenRouter = createRouter({
  list: publicQuery
    .input(z.object({ userId: z.number().optional(), type: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.userId) conditions.push(eq(tokens.userId, input.userId));
      if (input?.type) conditions.push(eq(tokens.type, input.type as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(tokens).where(where).orderBy(desc(tokens.createdAt));
    }),

  getBalance: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(tokens)
        .where(eq(tokens.userId, input.userId))
        .orderBy(desc(tokens.createdAt))
        .limit(1);
      return { balance: rows[0]?.balance ?? 0 };
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        plantationId: z.number().optional(),
        type: z.enum([
          "planting",
          "monitoring",
          "survival_high",
          "survival_milestone",
          "verification",
          "community_report",
          "badge_unlock",
          "penalty_fake_gps",
          "penalty_duplicate",
          "penalty_spam",
        ]),
        amount: z.number(),
        balance: z.number(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(tokens).values(input);
      return { id: Number(result[0].insertId) };
    }),

  getBadges: publicQuery
    .input(z.object({ userId: z.number() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.userId) conditions.push(eq(badges.userId, input.userId));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(badges).where(where).orderBy(desc(badges.awardedAt));
    }),

  getLeaderboard: publicQuery
    .input(z.object({ period: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.period) conditions.push(eq(leaderboard.period, input.period as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(leaderboard).where(where).orderBy(leaderboard.rank);
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const allTokens = await db.select().from(tokens);
    const earned = allTokens.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const penalties = allTokens.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const allBadges = await db.select().from(badges);
    const byType = allTokens.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalEarned: earned,
      totalPenalties: penalties,
      netBalance: earned - penalties,
      totalTransactions: allTokens.length,
      totalBadges: allBadges.length,
      byType,
    };
  }),
});
