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
import { Button } from "@/components/ui/button";
import {
  ScanEye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TreePine,
  BarChart3,
} from "lucide-react";

export default function Verification() {
  const { data: verifications, isLoading } = trpc.verification.list.useQuery();
  const { data: stats } = trpc.verification.stats.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Verification</h1>
          <p className="text-muted-foreground">
            {stats?.total ?? 0} verifications | {stats?.flagged ?? 0} flagged
          </p>
        </div>
        <Button>
          <ScanEye className="h-4 w-4 mr-2" />
          Run Verification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <ScanEye className="h-5 w-5 text-violet-600 mb-1" />
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Clock className="h-5 w-5 text-amber-600 mb-1" />
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats?.byStatus?.pending ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold">{stats?.byStatus?.approved ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <XCircle className="h-5 w-5 text-red-600 mb-1" />
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">{stats?.byStatus?.rejected ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mb-1" />
            <p className="text-sm text-muted-foreground">Flagged</p>
            <p className="text-2xl font-bold">{stats?.flagged ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Avg Confidence */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Average AI Confidence</span>
            </div>
            <span className="text-2xl font-bold">
              {((stats?.avgConfidence ?? 0) * 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={(stats?.avgConfidence ?? 0) * 100}
            className="h-3 mt-2"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plantation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Human Verified</TableHead>
                <TableHead>Notes</TableHead>
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
              ) : verifications?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No verifications found
                  </TableCell>
                </TableRow>
              ) : (
                verifications?.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{v.plantationName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs capitalize">
                        {v.type.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Number(v.aiConfidence ?? 0) * 100}
                          className="w-12 h-2"
                        />
                        <span className="text-sm">
                          {(Number(v.aiConfidence ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {v.detectedCount?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell>
                      {v.humanVerified ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {v.verifiedBy}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {v.notes}
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

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "unknown";
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    flagged: "bg-orange-100 text-orange-700",
    unknown: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={variants[s] ?? variants.unknown}>
      {s}
    </Badge>
  );
}
