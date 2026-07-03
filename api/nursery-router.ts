import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { nurseries, nurseryStock, species } from "@db/schema";
import { eq, desc, like, and } from "drizzle-orm";

export const nurseryRouter = createRouter({
  list: publicQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.search) {
        conditions.push(like(nurseries.name, `%${input.search}%`));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db
        .select()
        .from(nurseries)
        .where(where)
        .orderBy(desc(nurseries.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(nurseries)
        .where(eq(nurseries.id, input.id));
      return rows[0] ?? null;
    }),

  getStock: publicQuery
    .input(z.object({ nurseryId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: nurseryStock.id,
          nurseryId: nurseryStock.nurseryId,
          speciesId: nurseryStock.speciesId,
          speciesName: species.commonName,
          scientificName: species.scientificName,
          category: species.category,
          quantity: nurseryStock.quantity,
          age: nurseryStock.age,
          batchNumber: nurseryStock.batchNumber,
          healthStatus: nurseryStock.healthStatus,
          createdAt: nurseryStock.createdAt,
        })
        .from(nurseryStock)
        .leftJoin(species, eq(nurseryStock.speciesId, species.id))
        .where(eq(nurseryStock.nurseryId, input.nurseryId));
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        organizationId: z.number(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        capacity: z.number().optional(),
        managerName: z.string().optional(),
        managerContact: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(nurseries).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        capacity: z.number().optional(),
        managerName: z.string().optional(),
        managerContact: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(nurseries).set(data).where(eq(nurseries.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(nurseries).where(eq(nurseries.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const allNurseries = await db.select().from(nurseries);
    const allStock = await db.select().from(nurseryStock);
    const totalCapacity = allNurseries.reduce(
      (sum, n) => sum + (n.capacity || 0),
      0
    );
    const totalStock = allStock.reduce((sum, s) => sum + s.quantity, 0);
    return {
      total: allNurseries.length,
      totalCapacity,
      totalStock,
      active: allNurseries.filter((n) => n.isActive).length,
    };
  }),
});
