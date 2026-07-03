import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(z.object({ isRead: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.isRead !== undefined) {
        conditions.push(eq(notifications.isRead, input.isRead));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(notifications).where(where).orderBy(desc(notifications.createdAt));
    }),

  getUnreadCount: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, false));
    return { count: rows.length };
  }),

  markAsRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllAsRead: publicQuery.mutation(async () => {
    const db = getDb();
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.isRead, false));
    return { success: true };
  }),

  create: publicQuery
    .input(
      z.object({
        type: z.enum([
          "planting_reminder",
          "monitoring_due",
          "alert_survival_low",
          "alert_ndvi_anomaly",
          "ai_verification_result",
          "token_reward",
          "report_ready",
          "system",
        ]),
        title: z.string().min(1),
        message: z.string().min(1),
        referenceId: z.number().optional(),
        referenceType: z.string().optional(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(notifications).values(input);
      return { id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(notifications).where(eq(notifications.id, input.id));
      return { success: true };
    }),
});
