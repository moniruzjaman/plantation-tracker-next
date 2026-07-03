import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { satelliteRecords, plantations } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const satelliteRouter = createRouter({
  list: publicQuery
    .input(z.object({ plantationId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.plantationId) {
        conditions.push(eq(satelliteRecords.plantationId, input.plantationId));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db
        .select({
          id: satelliteRecords.id,
          plantationId: satelliteRecords.plantationId,
          plantationName: plantations.name,
          captureDate: satelliteRecords.captureDate,
          ndviAverage: satelliteRecords.ndviAverage,
          ndviMin: satelliteRecords.ndviMin,
          ndviMax: satelliteRecords.ndviMax,
          eviAverage: satelliteRecords.eviAverage,
          saviAverage: satelliteRecords.saviAverage,
          ndwiAverage: satelliteRecords.ndwiAverage,
          gndviAverage: satelliteRecords.gndviAverage,
          cloudCover: satelliteRecords.cloudCover,
          dataSource: satelliteRecords.dataSource,
          anomalyFlags: satelliteRecords.anomalyFlags,
          createdAt: satelliteRecords.createdAt,
        })
        .from(satelliteRecords)
        .leftJoin(
          plantations,
          eq(satelliteRecords.plantationId, plantations.id)
        )
        .where(where)
        .orderBy(desc(satelliteRecords.captureDate));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(satelliteRecords)
        .where(eq(satelliteRecords.id, input.id));
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        plantationId: z.number(),
        captureDate: z.date(),
        ndviAverage: z.string().optional(),
        ndviMin: z.string().optional(),
        ndviMax: z.string().optional(),
        eviAverage: z.string().optional(),
        cloudCover: z.number().optional(),
        dataSource: z.string().optional(),
        anomalyFlags: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(satelliteRecords).values(input);
      return { id: Number(result[0].insertId) };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(satelliteRecords);
    const avgNdvi =
      all.length > 0
        ? all.reduce((sum, r) => sum + Number(r.ndviAverage || 0), 0) /
          all.length
        : 0;
    return {
      totalScans: all.length,
      avgNdvi: Number(avgNdvi.toFixed(4)),
      recentScans: all.slice(0, 5),
    };
  }),
});
