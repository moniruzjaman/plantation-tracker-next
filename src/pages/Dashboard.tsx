import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TreePine,
  Building2,
  Sprout,
  ClipboardCheck,
  Satellite,
  TrendingUp,
  Leaf,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const { data: dashboard, isLoading } = trpc.analytics.dashboard.useQuery();

  const summaryCards = [
    {
      title: "Total Plantations",
      value: dashboard?.summary.totalPlantations ?? 0,
      icon: TreePine,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Saplings",
      value: dashboard?.summary.totalSaplings?.toLocaleString() ?? 0,
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Area (ha)",
      value: dashboard?.summary.totalArea ?? 0,
      icon: Sprout,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Organizations",
      value: dashboard?.summary.totalOrganizations ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Monitoring Visits",
      value: dashboard?.summary.totalMonitoringVisits ?? 0,
      icon: ClipboardCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Avg Survival Rate",
      value: `${dashboard?.summary.avgSurvival ?? 0}%`,
      icon: TrendingUp,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Satellite Scans",
      value: dashboard?.summary.totalSatelliteScans ?? 0,
      icon: Satellite,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Avg NDVI",
      value: dashboard?.summary.avgNdvi ?? 0,
      icon: Activity,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of plantation activities across Kurigram district
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="text-2xl font-bold">{card.value}</p>
                    )}
                  </div>
                  <div className={`${card.bg} p-3 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plantation Status & Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plantation Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard?.byStatus &&
                  Object.entries(dashboard.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        <span className="text-sm capitalize">{status.replace(/_/g, " ")}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plantation Types</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard?.byType &&
                  Object.entries(dashboard.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${Math.max(
                                5,
                                (count / Math.max(...Object.values(dashboard.byType ?? {}))) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="font-medium w-4">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard?.recentActivity?.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  <div className="bg-muted p-2 rounded-full">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {activity.action}{" "}
                      {activity.entityType && (
                        <span className="text-muted-foreground font-normal">
                          {activity.entityType}
                        </span>
                      )}
                    </p>
                    {Boolean(activity.details) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {JSON.stringify(activity.details).slice(0, 60)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    planned: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    maintaining: "bg-amber-100 text-amber-700",
    completed_closed: "bg-gray-100 text-gray-700",
    unknown: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={variants[status] ?? variants.unknown}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
