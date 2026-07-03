import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Satellite, Cloud, TrendingUp, Calendar, TreePine } from "lucide-react";

export default function SatellitePage() {
  const { data: records, isLoading } = trpc.satellite.list.useQuery();
  const { data: stats } = trpc.satellite.stats.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Satellite (NDVI)</h1>
        <p className="text-muted-foreground">
          {stats?.totalScans ?? 0} satellite scans | Avg NDVI: {stats?.avgNdvi ?? 0}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-violet-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats?.totalScans ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg NDVI</p>
                <p className="text-2xl font-bold">{stats?.avgNdvi ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Data Source</p>
                <p className="text-2xl font-bold">Sentinel-2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NDVI Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">NDVI Scale Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
            <div className="flex-1 bg-red-700 h-full flex items-center justify-center text-white text-xs">-1.0</div>
            <div className="flex-1 bg-red-500 h-full" />
            <div className="flex-1 bg-orange-400 h-full" />
            <div className="flex-1 bg-yellow-300 h-full" />
            <div className="flex-1 bg-yellow-100 h-full" />
            <div className="flex-1 bg-green-200 h-full" />
            <div className="flex-1 bg-green-400 h-full" />
            <div className="flex-1 bg-green-600 h-full" />
            <div className="flex-1 bg-green-800 h-full flex items-center justify-center text-white text-xs">+1.0</div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Dead vegetation / Water</span>
            <span>Sparse vegetation</span>
            <span>Moderate vegetation</span>
            <span>Dense vegetation</span>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">NDVI Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plantation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>NDVI</TableHead>
                <TableHead>EVI</TableHead>
                <TableHead>Cloud Cover</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
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
              ) : records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No satellite records found
                  </TableCell>
                </TableRow>
              ) : (
                records?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{r.plantationName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {r.captureDate
                          ? new Date(r.captureDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <NdviBadge value={Number(r.ndviAverage ?? 0)} />
                        <span className="text-sm font-medium">
                          {Number(r.ndviAverage ?? 0).toFixed(3)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {Number(r.eviAverage ?? 0).toFixed(3)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={r.cloudCover ?? 0}
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{r.cloudCover}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        {r.dataSource}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.anomalyFlags ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                          Flagged
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                          Normal
                        </Badge>
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

function NdviBadge({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v < 0.2) return "bg-red-500";
    if (v < 0.4) return "bg-yellow-400";
    if (v < 0.6) return "bg-green-300";
    if (v < 0.8) return "bg-green-500";
    return "bg-green-700";
  };
  return (
    <div
      className={`w-3 h-3 rounded-full ${getColor(value)}`}
      title={`NDVI: ${value.toFixed(3)}`}
    />
  );
}
