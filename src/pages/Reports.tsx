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
import {
  FileText,
  Plus,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

export default function Reports() {
  const { data: reports, isLoading } = trpc.report.list.useQuery();
  const { data: stats } = trpc.report.stats.useQuery();
  const utils = trpc.useUtils();
  const updateReport = trpc.report.update.useMutation({
    onSuccess: () => utils.report.list.invalidate(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            {stats?.total ?? 0} reports |{" "}
            {stats?.byStatus?.ready ?? 0} ready
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <Loader2 className="h-5 w-5 text-amber-600 mb-1 animate-spin" />
            <p className="text-sm text-muted-foreground">Generating</p>
            <p className="text-2xl font-bold">
              {stats?.byStatus?.generating ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-2xl font-bold">{stats?.byStatus?.ready ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <XCircle className="h-5 w-5 text-red-600 mb-1" />
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold">
              {stats?.byStatus?.failed ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : reports?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                reports?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">{r.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {r.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.organizationName || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.status === "ready" && r.fileUrl ? (
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      ) : r.status === "generating" ? (
                        <Button variant="outline" size="sm" disabled>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processing
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateReport.mutate({
                              id: r.id,
                              status: "ready",
                              fileUrl: `/reports/report-${r.id}.pdf`,
                            })
                          }
                        >
                          Retry
                        </Button>
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

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "unknown";
  const variants: Record<string, string> = {
    generating: "bg-amber-100 text-amber-700",
    ready: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    unknown: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={variants[s] ?? variants.unknown}>
      {s}
    </Badge>
  );
}
