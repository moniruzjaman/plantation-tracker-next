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
import { Building2, Plus, Search, Phone, Mail, Globe } from "lucide-react";
import { useState } from "react";

export default function Organizations() {
  const [search, setSearch] = useState("");
  const { data: orgs, isLoading } = trpc.organization.list.useQuery(
    search ? { search } : undefined
  );
  const { data: stats } = trpc.organization.stats.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            {stats?.total ?? 0} organizations registered
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{stats?.active ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Types</p>
            <p className="text-2xl font-bold">
              {stats?.byType ? Object.keys(stats.byType).length : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orgs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                orgs?.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{org.name}</p>
                          {org.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {org.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {org.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.contactPerson || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {org.contactEmail && (
                          <span className="text-xs flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {org.contactEmail}
                          </span>
                        )}
                        {org.contactPhone && (
                          <span className="text-xs flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {org.contactPhone}
                          </span>
                        )}
                        {org.website && (
                          <span className="text-xs flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {org.website}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {org.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
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
