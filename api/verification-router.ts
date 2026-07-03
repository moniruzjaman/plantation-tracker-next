import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { aiVerifications, plantations } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const verificationRouter = createRouter({
  list: publicQuery
    .input(z.object({ plantationId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.plantationId) {
        conditions.push(eq(aiVerifications.plantationId, input.plantationId));
      }
      if (input?.status) {
        conditions.push(eq(aiVerifications.status, input.status as any));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db
        .select({
          id: aiVerifications.id,
          plantationId: aiVerifications.plantationId,
          plantationName: plantations.name,
          type: aiVerifications.type,
          status: aiVerifications.status,
          aiConfidence: aiVerifications.aiConfidence,
          detectedCount: aiVerifications.detectedCount,
          humanVerified: aiVerifications.humanVerified,
          verifiedBy: aiVerifications.verifiedBy,
          result: aiVerifications.result,
          notes: aiVerifications.notes,
          createdAt: aiVerifications.createdAt,
        })
        .from(aiVerifications)
        .leftJoin(plantations, eq(aiVerifications.plantationId, plantations.id))
        .where(where)
        .orderBy(desc(aiVerifications.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(aiVerifications).where(eq(aiVerifications.id, input.id));
      return rows[0] ?? null;
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "flagged"]).optional(),
        humanVerified: z.boolean().optional(),
        verifiedBy: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(aiVerifications).set(data).where(eq(aiVerifications.id, id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(aiVerifications);
    const byStatus = all.reduce((acc, v) => {
      const key = v.status ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byType = all.reduce((acc, v) => {
      const key = v.type ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgConfidence = all.length > 0
      ? all.reduce((sum, v) => sum + Number(v.aiConfidence || 0), 0) / all.length
      : 0;
    return {
      total: all.length,
      byStatus,
      byType,
      avgConfidence: Number(avgConfidence.toFixed(4)),
      flagged: all.filter((v) => v.status === "flagged").length,
    };
  }),
});
