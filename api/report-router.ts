import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reports, organizations, plantations } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const reportRouter = createRouter({
  list: publicQuery
    .input(z.object({ type: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.type) conditions.push(eq(reports.type, input.type as any));
      if (input?.status) conditions.push(eq(reports.status, input.status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db
        .select({
          id: reports.id,
          title: reports.title,
          type: reports.type,
          organizationName: organizations.name,
          plantationName: plantations.name,
          status: reports.status,
          fileUrl: reports.fileUrl,
          createdAt: reports.createdAt,
        })
        .from(reports)
        .leftJoin(organizations, eq(reports.organizationId, organizations.id))
        .leftJoin(plantations, eq(reports.plantationId, plantations.id))
        .where(where)
        .orderBy(desc(reports.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(reports).where(eq(reports.id, input.id));
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        type: z.enum([
          "plantation_summary",
          "monitoring_report",
          "ndvi_analysis",
          "survival_analysis",
          "organization_report",
          "token_report",
          "custom",
        ]),
        organizationId: z.number().optional(),
        plantationId: z.number().optional(),
        filters: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(reports).values(input);
      return { id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(reports).where(eq(reports.id, input.id));
      return { success: true };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["generating", "ready", "failed"]).optional(),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(reports).set(data).where(eq(reports.id, id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(reports);
    const byStatus = all.reduce((acc, r) => {
      const key = r.status ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total: all.length, byStatus };
  }),
});
