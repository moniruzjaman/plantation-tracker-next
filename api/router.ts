import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { organizationRouter } from "./organization-router";
import { nurseryRouter } from "./nursery-router";
import { plantationRouter } from "./plantation-router";
import { monitoringRouter } from "./monitoring-router";
import { satelliteRouter } from "./satellite-router";
import { verificationRouter } from "./verification-router";
import { reportRouter } from "./report-router";
import { notificationRouter } from "./notification-router";
import { tokenRouter } from "./token-router";
import { analyticsRouter } from "./analytics-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  organization: organizationRouter,
  nursery: nurseryRouter,
  plantation: plantationRouter,
  monitoring: monitoringRouter,
  satellite: satelliteRouter,
  verification: verificationRouter,
  report: reportRouter,
  notification: notificationRouter,
  token: tokenRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
