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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TreePine, Plus, Search, MapPin, Calendar, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Plantations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const { data: plantations, isLoading } = trpc.plantation.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const { data: stats } = trpc.plantation.stats.useQuery();

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "osm": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap Contributors",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: [89.6362, 25.8054],
        zoom: 10,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && plantations && plantations.length > 0) {
      const markers: maplibregl.Marker[] = [];

      plantations.forEach((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const el = document.createElement("div");
          el.className = "plantation-marker";
          el.style.cssText = `
            width: 24px; height: 24px; background: #16a34a; border-radius: 50%;
            border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
          `;
          el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/></svg>`;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div style="padding:8px;">
                  <strong>${p.name}</strong><br/>
                  <span style="font-size:12px;color:#666;">${p.type} | ${p.status}</span><br/>
                  <span style="font-size:12px;">${p.totalSaplings?.toLocaleString()} saplings</span>
                </div>`
              )
            )
            .addTo(map.current!);
          markers.push(marker);
        }
      });

      return () => {
        markers.forEach((m) => m.remove());
      };
    }
  }, [plantations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plantations</h1>
          <p className="text-muted-foreground">
            {stats?.total ?? 0} plantations | {stats?.totalSaplings?.toLocaleString() ?? 0} saplings | {stats?.totalArea} ha
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Plantation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats?.byStatus &&
          Object.entries(stats.byStatus).map(([status, count]) => (
            <Card key={status}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground capitalize">
                  {status.replace(/_/g, " ")}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plantations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="maintaining">Maintaining</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="afforestation">Afforestation</SelectItem>
            <SelectItem value="reforestation">Reforestation</SelectItem>
            <SelectItem value="agroforestry">Agroforestry</SelectItem>
            <SelectItem value="urban">Urban</SelectItem>
            <SelectItem value="community">Community</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="mangrove">Mangrove</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="w-full h-80 rounded-lg border"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Saplings</TableHead>
                <TableHead>Planted</TableHead>
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
              ) : plantations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No plantations found
                  </TableCell>
                </TableRow>
              ) : (
                plantations?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.district}, {p.upazila}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        <Layers className="h-3 w-3 mr-1" />
                        {p.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>{p.areaHectares} ha</TableCell>
                    <TableCell>{p.totalSaplings?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {p.plantedDate
                          ? new Date(p.plantedDate).toLocaleDateString()
                          : "-"}
                      </span>
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
    planned: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    maintaining: "bg-amber-100 text-amber-700",
    completed_closed: "bg-gray-100 text-gray-700",
    unknown: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={variants[s] ?? variants.unknown}>
      {s.replace(/_/g, " ")}
    </Badge>
  );
}
