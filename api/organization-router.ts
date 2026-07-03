import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { organizations } from "@db/schema";
import { eq, desc, like, and } from "drizzle-orm";

export const organizationRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          type: z.string().optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.search) {
        conditions.push(like(organizations.name, `%${input.search}%`));
      }
      if (input?.type) {
        conditions.push(eq(organizations.type, input.type as any));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(organizations.isActive, input.isActive));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(organizations).where(where).orderBy(desc(organizations.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id));
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum([
          "government",
          "ngo",
          "private",
          "community",
          "research",
        ]),
        description: z.string().optional(),
        address: z.string().optional(),
        contactPerson: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(organizations).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum([
          "government",
          "ngo",
          "private",
          "community",
          "research",
        ]).optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        contactPerson: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        website: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(organizations).set(data).where(eq(organizations.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(organizations).where(eq(organizations.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(organizations);
    const byType = all.reduce((acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total: all.length,
      active: all.filter((o) => o.isActive).length,
      byType,
    };
  }),
});
