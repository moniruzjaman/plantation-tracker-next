import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { plantations, organizations, species, nurseries } from "@db/schema";
import { eq, desc, like, and } from "drizzle-orm";

export const plantationRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          status: z.string().optional(),
          type: z.string().optional(),
          organizationId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.search) {
        conditions.push(like(plantations.name, `%${input.search}%`));
      }
      if (input?.status) {
        conditions.push(eq(plantations.status, input.status as any));
      }
      if (input?.type) {
        conditions.push(eq(plantations.type, input.type as any));
      }
      if (input?.organizationId) {
        conditions.push(
          eq(plantations.organizationId, input.organizationId)
        );
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db
        .select({
          id: plantations.id,
          name: plantations.name,
          organizationId: plantations.organizationId,
          organizationName: organizations.name,
          nurseryId: plantations.nurseryId,
          speciesId: plantations.speciesId,
          speciesName: species.commonName,
          type: plantations.type,
          status: plantations.status,
          latitude: plantations.latitude,
          longitude: plantations.longitude,
          areaHectares: plantations.areaHectares,
          totalSaplings: plantations.totalSaplings,
          plantedDate: plantations.plantedDate,
          expectedCompletion: plantations.expectedCompletion,
          description: plantations.description,
          district: plantations.district,
          division: plantations.division,
          upazila: plantations.upazila,
          createdAt: plantations.createdAt,
        })
        .from(plantations)
        .leftJoin(
          organizations,
          eq(plantations.organizationId, organizations.id)
        )
        .leftJoin(species, eq(plantations.speciesId, species.id))
        .where(where)
        .orderBy(desc(plantations.createdAt));
      return rows;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          id: plantations.id,
          name: plantations.name,
          organizationId: plantations.organizationId,
          organizationName: organizations.name,
          nurseryId: plantations.nurseryId,
          nurseryName: nurseries.name,
          speciesId: plantations.speciesId,
          speciesName: species.commonName,
          type: plantations.type,
          status: plantations.status,
          latitude: plantations.latitude,
          longitude: plantations.longitude,
          areaHectares: plantations.areaHectares,
          totalSaplings: plantations.totalSaplings,
          plantedDate: plantations.plantedDate,
          expectedCompletion: plantations.expectedCompletion,
          description: plantations.description,
          district: plantations.district,
          division: plantations.division,
          upazila: plantations.upazila,
          unionName: plantations.unionName,
          mouza: plantations.mouza,
          createdAt: plantations.createdAt,
        })
        .from(plantations)
        .leftJoin(
          organizations,
          eq(plantations.organizationId, organizations.id)
        )
        .leftJoin(species, eq(plantations.speciesId, species.id))
        .leftJoin(nurseries, eq(plantations.nurseryId, nurseries.id))
        .where(eq(plantations.id, input.id));
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        organizationId: z.number(),
        nurseryId: z.number().optional(),
        speciesId: z.number().optional(),
        type: z.enum([
          "afforestation",
          "reforestation",
          "agroforestry",
          "urban",
          "mangrove",
          "community",
          "commercial",
        ]),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        areaHectares: z.string().optional(),
        totalSaplings: z.number().optional(),
        plantedDate: z.date().optional(),
        expectedCompletion: z.date().optional(),
        description: z.string().optional(),
        district: z.string().optional(),
        division: z.string().optional(),
        upazila: z.string().optional(),
        unionName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(plantations).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        status: z.enum([
          "planned",
          "in_progress",
          "completed",
          "maintaining",
          "completed_closed",
        ]).optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        areaHectares: z.string().optional(),
        totalSaplings: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(plantations).set(data).where(eq(plantations.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(plantations).where(eq(plantations.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(plantations);
    const byStatus = all.reduce((acc, p) => {
      const key = p.status ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byType = all.reduce((acc, p) => {
      const key = p.type ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalSaplings = all.reduce(
      (sum, p) => sum + (p.totalSaplings || 0),
      0
    );
    const totalArea = all.reduce(
      (sum, p) => sum + Number(p.areaHectares || 0),
      0
    );
    return {
      total: all.length,
      byStatus,
      byType,
      totalSaplings,
      totalArea: Number(totalArea.toFixed(2)),
    };
  }),
});
