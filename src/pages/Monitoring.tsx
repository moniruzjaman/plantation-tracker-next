import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardCheck,
  Plus,
  TrendingUp,
  Bug,
  Calendar,
  Ruler,
  TreePine,
} from "lucide-react";

export default function Monitoring() {
  const { data: visits, isLoading } = trpc.monitoring.list.useQuery();
  const { data: stats } = trpc.monitoring.stats.useQuery();

  const healthOrder = ["excellent", "good", "fair", "poor", "critical"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitoring</h1>
          <p className="text-muted-foreground">
            {stats?.totalVisits ?? 0} visits | {stats?.avgSurvival ?? 0}% avg survival
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Visit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{stats?.totalVisits ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Survival</p>
                <p className="text-2xl font-bold">{stats?.avgSurvival ?? 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pest Issues</p>
                <p className="text-2xl font-bold">{stats?.pestIssues ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Health Distribution</p>
            <div className="space-y-1">
              {healthOrder.map((h) => {
                const count = stats?.byHealth?.[h] ?? 0;
                const total = stats?.totalVisits ?? 1;
                return (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-xs capitalize w-12">{h}</span>
                    <Progress value={(count / total) * 100} className="h-2 flex-1" />
                    <span className="text-xs w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plantation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Survival</TableHead>
                <TableHead>Height</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Pest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : visits?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No monitoring visits recorded
                  </TableCell>
                </TableRow>
              ) : (
                visits?.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{v.plantationName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {v.visitDate
                          ? new Date(v.visitDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={v.survivalRate ?? 0} className="w-16 h-2" />
                        <span className="text-sm">{v.survivalRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Ruler className="h-3 w-3" />
                        {v.averageHeight}m
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {v.growthStage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <HealthBadge status={v.healthStatus} />
                    </TableCell>
                    <TableCell>
                      {v.pestDiseaseObserved ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                          <Bug className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthBadge({ status }: { status: string | null }) {
  const s = status ?? "unknown";
  const variants: Record<string, string> = {
    excellent: "bg-green-100 text-green-700",
    good: "bg-blue-100 text-blue-700",
    fair: "bg-amber-100 text-amber-700",
    poor: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
    unknown: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={variants[s] ?? variants.unknown}>
      {s}
    </Badge>
  );
}
