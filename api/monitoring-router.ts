import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { monitoringVisits, plantations } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const monitoringRouter = createRouter({
  list: publicQuery
    .input(z.object({ plantationId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.plantationId) {
        conditions.push(eq(monitoringVisits.plantationId, input.plantationId));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db
        .select({
          id: monitoringVisits.id,
          plantationId: monitoringVisits.plantationId,
          plantationName: plantations.name,
          visitedBy: monitoringVisits.visitedBy,
          visitDate: monitoringVisits.visitDate,
          survivalRate: monitoringVisits.survivalRate,
          averageHeight: monitoringVisits.averageHeight,
          growthStage: monitoringVisits.growthStage,
          healthStatus: monitoringVisits.healthStatus,
          pestDiseaseObserved: monitoringVisits.pestDiseaseObserved,
          maintenanceDone: monitoringVisits.maintenanceDone,
          notes: monitoringVisits.notes,
          createdAt: monitoringVisits.createdAt,
        })
        .from(monitoringVisits)
        .leftJoin(
          plantations,
          eq(monitoringVisits.plantationId, plantations.id)
        )
        .where(where)
        .orderBy(desc(monitoringVisits.visitDate));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(monitoringVisits)
        .where(eq(monitoringVisits.id, input.id));
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        plantationId: z.number(),
        visitedBy: z.string().min(1),
        visitDate: z.date(),
        survivalRate: z.number().optional(),
        averageHeight: z.string().optional(),
        growthStage: z
          .enum(["seedling", "sapling", "juvenile", "mature"])
          .optional(),
        healthStatus: z
          .enum(["excellent", "good", "fair", "poor", "critical"])
          .optional(),
        pestDiseaseObserved: z.boolean().optional(),
        pestDiseaseDetails: z.string().optional(),
        maintenanceNeeded: z.string().optional(),
        maintenanceDone: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(monitoringVisits).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        survivalRate: z.number().optional(),
        averageHeight: z.string().optional(),
        growthStage: z
          .enum(["seedling", "sapling", "juvenile", "mature"])
          .optional(),
        healthStatus: z
          .enum(["excellent", "good", "fair", "poor", "critical"])
          .optional(),
        maintenanceDone: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db
        .update(monitoringVisits)
        .set(data)
        .where(eq(monitoringVisits.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(monitoringVisits)
        .where(eq(monitoringVisits.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(monitoringVisits);
    const avgSurvival =
      all.length > 0
        ? all.reduce((sum, v) => sum + (v.survivalRate || 0), 0) / all.length
        : 0;
    const byHealth = all.reduce((acc, v) => {
      const key = v.healthStatus ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const pestIssues = all.filter((v) => v.pestDiseaseObserved).length;
    return {
      totalVisits: all.length,
      avgSurvival: Math.round(avgSurvival),
      byHealth,
      pestIssues,
    };
  }),
});
