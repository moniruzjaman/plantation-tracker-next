import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  plantations,
  monitoringVisits,
  satelliteRecords,
  organizations,
  nurseries,
  activityLog,
} from "@db/schema";
import { desc } from "drizzle-orm";

export const analyticsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();

    const allPlantations = await db.select().from(plantations);
    const allVisits = await db.select().from(monitoringVisits);
    const allSatellite = await db.select().from(satelliteRecords);
    const allOrgs = await db.select().from(organizations);
    const allNurseries = await db.select().from(nurseries);

    const totalSaplings = allPlantations.reduce(
      (s, p) => s + (p.totalSaplings || 0),
      0
    );
    const totalArea = Number(
      allPlantations.reduce((s, p) => s + Number(p.areaHectares || 0), 0).toFixed(2)
    );
    const avgSurvival =
      allVisits.length > 0
        ? Math.round(
            allVisits.reduce((s, v) => s + (v.survivalRate || 0), 0) /
              allVisits.length
          )
        : 0;
    const avgNdvi =
      allSatellite.length > 0
        ? Number(
            (
              allSatellite.reduce(
                (s, r) => s + Number(r.ndviAverage || 0),
                0
              ) / allSatellite.length
            ).toFixed(4)
          )
        : 0;

    const byStatus = allPlantations.reduce((acc, p) => {
      const key = p.status ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = allPlantations.reduce((acc, p) => {
      const key = p.type ?? "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = await db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(10);

    return {
      summary: {
        totalPlantations: allPlantations.length,
        totalOrganizations: allOrgs.length,
        totalNurseries: allNurseries.length,
        totalSaplings,
        totalArea,
        totalMonitoringVisits: allVisits.length,
        avgSurvival,
        avgNdvi,
        totalSatelliteScans: allSatellite.length,
      },
      byStatus,
      byType,
      recentActivity,
    };
  }),

  survivalTrend: publicQuery.query(async () => {
    const db = getDb();
    const visits = await db
      .select()
      .from(monitoringVisits)
      .orderBy(monitoringVisits.visitDate);

    const trend = visits.map((v) => ({
      date: v.visitDate,
      plantationId: v.plantationId,
      survivalRate: v.survivalRate,
      growthStage: v.growthStage,
      healthStatus: v.healthStatus,
    }));
    return trend;
  }),

  ndviTrend: publicQuery.query(async () => {
    const db = getDb();
    const records = await db
      .select()
      .from(satelliteRecords)
      .orderBy(satelliteRecords.captureDate);
    return records.map((r) => ({
      date: r.captureDate,
      plantationId: r.plantationId,
      ndvi: Number(r.ndviAverage || 0),
      evi: Number(r.eviAverage || 0),
      ndwi: Number(r.ndwiAverage || 0),
    }));
  }),

  activityHeatmap: publicQuery.query(async () => {
    const db = getDb();
    const activities = await db.select().from(activityLog);
    const byAction = activities.reduce((acc, a) => {
      acc[a.action] = (acc[a.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byEntity = activities.reduce((acc, a) => {
      const type = a.entityType || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { byAction, byEntity };
  }),
});
