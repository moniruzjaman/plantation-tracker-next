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
import {
  Coins,
  Trophy,
  Award,
  TrendingUp,
  TreePine,
  Shield,
  Star,
  Zap,
  Heart,
  Target,
  Clock,
  Medal,
} from "lucide-react";

export default function Tokens() {
  const { data: stats } = trpc.token.stats.useQuery();
  const { data: tokens } = trpc.token.list.useQuery();
  const { data: badges } = trpc.token.getBadges.useQuery();
  const { data: leaderboard } = trpc.token.getLeaderboard.useQuery();

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "first_planting":
        return <TreePine className="h-5 w-5 text-green-600" />;
      case "hundred_trees":
        return <Target className="h-5 w-5 text-blue-600" />;
      case "monitoring_expert":
        return <Shield className="h-5 w-5 text-violet-600" />;
      case "survival_champion":
        return <Heart className="h-5 w-5 text-rose-600" />;
      case "community_hero":
        return <Star className="h-5 w-5 text-amber-600" />;
      case "consistent_planter":
        return <Clock className="h-5 w-5 text-teal-600" />;
      case "carbon_warrior":
        return <Zap className="h-5 w-5 text-emerald-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Token Economy</h1>
        <p className="text-muted-foreground">
          Reward system for verified plantation activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Coins className="h-5 w-5 text-amber-600 mb-1" />
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold">
              {stats?.totalEarned?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
            <p className="text-sm text-muted-foreground">Net Balance</p>
            <p className="text-2xl font-bold">
              {stats?.netBalance?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Medal className="h-5 w-5 text-violet-600 mb-1" />
            <p className="text-sm text-muted-foreground">Total Badges</p>
            <p className="text-2xl font-bold">{stats?.totalBadges ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Trophy className="h-5 w-5 text-orange-600 mb-1" />
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">
              {stats?.totalTransactions ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Token Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!tokens ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : tokens.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No transactions
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${
                            t.amount > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          t.amount > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {t.amount > 0 ? "+" : ""}
                        {t.amount}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.balance?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-xs">
                        {t.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!badges ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No badges earned yet
              </p>
            ) : (
              <div className="space-y-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="bg-background p-2 rounded-full">
                      {getBadgeIcon(b.badgeType)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm capitalize">
                        {b.badgeType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Level {b.level} |{" "}
                        {b.awardedAt
                          ? new Date(b.awardedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Trees Planted</TableHead>
                <TableHead>Survived</TableHead>
                <TableHead>Monitoring</TableHead>
                <TableHead>Badges</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!leaderboard ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : leaderboard.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No leaderboard data
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.rank === 1 ? (
                        <Trophy className="h-5 w-5 text-amber-500" />
                      ) : entry.rank === 2 ? (
                        <Medal className="h-5 w-5 text-gray-400" />
                      ) : entry.rank === 3 ? (
                        <Medal className="h-5 w-5 text-amber-700" />
                      ) : (
                        <span className="text-sm font-medium ml-1">
                          #{entry.rank}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      User #{entry.userId}
                    </TableCell>
                    <TableCell className="font-bold">
                      {entry.score?.toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.treesPlanted?.toLocaleString()}</TableCell>
                    <TableCell>{entry.treesSurvived?.toLocaleString()}</TableCell>
                    <TableCell>{entry.monitoringCount}</TableCell>
                    <TableCell>{entry.badgeCount}</TableCell>
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
