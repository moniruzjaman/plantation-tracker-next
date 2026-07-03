import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Activity,
  TreePine,
  Leaf,
  Droplets,
} from "lucide-react";

export default function Analytics() {
  const { data: dashboard } =
    trpc.analytics.dashboard.useQuery();
  const { data: survivalTrend, isLoading: survLoading } =
    trpc.analytics.survivalTrend.useQuery();
  const { data: ndviTrend, isLoading: ndviLoading } =
    trpc.analytics.ndviTrend.useQuery();
  const { data: heatmap, isLoading: heatLoading } =
    trpc.analytics.activityHeatmap.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights and trends across all plantation data
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <TreePine className="h-5 w-5 text-green-600 mb-1" />
            <p className="text-sm text-muted-foreground">Plantations</p>
            <p className="text-2xl font-bold">
              {dashboard?.summary.totalPlantations ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Leaf className="h-5 w-5 text-emerald-600 mb-1" />
            <p className="text-sm text-muted-foreground">Total Saplings</p>
            <p className="text-2xl font-bold">
              {dashboard?.summary.totalSaplings?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-rose-600 mb-1" />
            <p className="text-sm text-muted-foreground">Avg Survival</p>
            <p className="text-2xl font-bold">
              {dashboard?.summary.avgSurvival ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Droplets className="h-5 w-5 text-cyan-600 mb-1" />
            <p className="text-sm text-muted-foreground">Avg NDVI</p>
            <p className="text-2xl font-bold">
              {dashboard?.summary.avgNdvi ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Survival Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Survival Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {survLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground mb-2">
                <span className="col-span-3">Plantation</span>
                <span className="col-span-2">Date</span>
                <span className="col-span-4">Survival Rate</span>
                <span className="col-span-3">Stage</span>
              </div>
              {survivalTrend?.slice(0, 10).map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-1 items-center py-2 border-b last:border-0"
                >
                  <span className="col-span-3 text-sm truncate">
                    Plantation #{s.plantationId}
                  </span>
                  <span className="col-span-2 text-sm text-muted-foreground">
                    {s.date ? new Date(s.date).toLocaleDateString() : "-"}
                  </span>
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (s.survivalRate ?? 0) >= 85
                            ? "bg-green-500"
                            : (s.survivalRate ?? 0) >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${s.survivalRate ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">
                      {s.survivalRate}%
                    </span>
                  </div>
                  <span className="col-span-3">
                    <Badge variant="outline" className="capitalize text-xs">
                      {s.growthStage}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NDVI Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            NDVI Trend Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ndviLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground mb-2">
                <span className="col-span-3">Plantation</span>
                <span className="col-span-2">Date</span>
                <span className="col-span-4">NDVI</span>
                <span className="col-span-3">EVI</span>
              </div>
              {ndviTrend?.slice(0, 10).map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-1 items-center py-2 border-b last:border-0"
                >
                  <span className="col-span-3 text-sm truncate">
                    Plantation #{r.plantationId}
                  </span>
                  <span className="col-span-2 text-sm text-muted-foreground">
                    {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                  </span>
                  <div className="col-span-4 flex items-center gap-2">
                    <NdviDot value={r.ndvi} />
                    <span className="text-sm font-medium">
                      {r.ndvi.toFixed(3)}
                    </span>
                  </div>
                  <span className="col-span-3 text-sm">{r.evi.toFixed(3)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {heatLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2">
                {heatmap?.byAction &&
                  Object.entries(heatmap.byAction)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{action}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.max(
                                  5,
                                  ((count as number) /
                                    Math.max(
                                      ...Object.values(heatmap.byAction as Record<string, number>)
                                    )) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm w-4">{count as number}</span>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {heatLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2">
                {heatmap?.byEntity &&
                  Object.entries(heatmap.byEntity)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([entity, count]) => (
                      <div key={entity} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{entity}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${Math.max(
                                  5,
                                  ((count as number) /
                                    Math.max(
                                      ...Object.values(heatmap.byEntity as Record<string, number>)
                                    )) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm w-4">{count as number}</span>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NdviDot({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v < 0.2) return "bg-red-500";
    if (v < 0.4) return "bg-yellow-400";
    if (v < 0.6) return "bg-green-300";
    if (v < 0.8) return "bg-green-500";
    return "bg-green-700";
  };
  return <div className={`w-3 h-3 rounded-full ${getColor(value)}`} />;
}
