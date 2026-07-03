import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CheckCheck,
  Leaf,
  AlertTriangle,
  Calendar,
  ScanEye,
  Coins,
  FileText,
  Info,
  ClipboardCheck,
} from "lucide-react";

export default function Notifications() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } =
    trpc.notification.list.useQuery();
  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery();

  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "planting_reminder":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "monitoring_due":
        return <ClipboardCheck className="h-4 w-4 text-blue-600" />;
      case "alert_survival_low":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "alert_ndvi_anomaly":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "ai_verification_result":
        return <ScanEye className="h-4 w-4 text-violet-600" />;
      case "token_reward":
        return <Coins className="h-4 w-4 text-amber-600" />;
      case "report_ready":
        return <FileText className="h-4 w-4 text-cyan-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "planting_reminder":
        return "bg-green-50 border-green-200";
      case "monitoring_due":
        return "bg-blue-50 border-blue-200";
      case "alert_survival_low":
      case "alert_ndvi_anomaly":
        return "bg-red-50 border-red-200";
      case "ai_verification_result":
        return "bg-violet-50 border-violet-200";
      case "token_reward":
        return "bg-amber-50 border-amber-200";
      case "report_ready":
        return "bg-cyan-50 border-cyan-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount?.count ?? 0} unread notifications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllAsRead.mutate()}
          disabled={!unreadCount?.count}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))
        ) : notifications?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No notifications
            </CardContent>
          </Card>
        ) : (
          notifications?.map((n) => (
            <Card
              key={n.id}
              className={`${getTypeColor(n.type)} ${
                !n.isRead ? "border-l-4 border-l-blue-500" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.isRead && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ""}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {n.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead.mutate({ id: n.id })}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
