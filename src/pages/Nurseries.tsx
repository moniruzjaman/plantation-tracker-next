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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sprout, Plus, Search, MapPin, Phone, Package } from "lucide-react";
import { useState } from "react";

export default function Nurseries() {
  const [search, setSearch] = useState("");
  const [selectedNursery, setSelectedNursery] = useState<number | null>(null);
  const { data: nurseries, isLoading } = trpc.nursery.list.useQuery(
    search ? { search } : undefined
  );
  const { data: stats } = trpc.nursery.stats.useQuery();
  const { data: stock } = trpc.nursery.getStock.useQuery(
    { nurseryId: selectedNursery! },
    { enabled: selectedNursery !== null }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nurseries</h1>
          <p className="text-muted-foreground">
            {stats?.total ?? 0} nurseries with {stats?.totalStock?.toLocaleString() ?? 0} seedlings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Nursery
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Nurseries</p>
            <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold">
              {stats?.totalCapacity?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Stock</p>
            <p className="text-2xl font-bold">
              {stats?.totalStock?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{stats?.active ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search nurseries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nursery</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : nurseries?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No nurseries found
                  </TableCell>
                </TableRow>
              ) : (
                nurseries?.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{n.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {n.location || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{n.capacity?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{n.managerName || "-"}</p>
                        {n.managerContact && (
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {n.managerContact}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {n.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedNursery(n.id)}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Stock
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{n.name} - Stock</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 max-h-96 overflow-auto">
                            {stock && stock.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Species</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Health</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {stock.map((s) => (
                                    <TableRow key={s.id}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium text-sm">
                                            {s.speciesName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {s.scientificName}
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell>{s.quantity?.toLocaleString()}</TableCell>
                                      <TableCell>{s.age} months</TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={`capitalize ${
                                            s.healthStatus === "excellent"
                                              ? "bg-green-100 text-green-700"
                                              : s.healthStatus === "good"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-amber-100 text-amber-700"
                                          }`}
                                        >
                                          {s.healthStatus}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-center text-muted-foreground py-4">
                                No stock data available
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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
