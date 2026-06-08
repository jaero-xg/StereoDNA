import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { spotifyApi } from "@/lib/api";
import { formatNumber, getPersonalityEmoji } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { DashboardData } from "@/types";
import {
  Music,
  Users,
  Clock,
  Globe,
  Calendar,
  Share2,
  Download,
  TrendingUp,
  Award,
  Star,
  Zap,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    spotifyApi
      .getDashboard("long_term")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load profile data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 max-w-3xl mx-auto space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!data || !user) {
    return (
      <div className="pt-20 pb-12 px-4 text-center">
        <p className="text-text-dim text-sm">Failed to load profile</p>
      </div>
    );
  }

  const { stats, personality, genres } = data;

  const handleShare = () => {
    const text = `${personality.archetype} ${getPersonalityEmoji(personality.archetype)}\nTop Genre: ${stats.topGenre} · ${formatNumber(stats.totalMinutes)} minutes · ${stats.uniqueArtists} artists`;
    if (navigator.share) {
      navigator.share({ title: "My StereoDNA Profile", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-4 pb-5 border-b border-border">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-14 h-14 rounded-full opacity-90"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center">
            <Music className="w-6 h-6 text-text-dim" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base text-text font-medium truncate">
            {user.displayName}
          </h1>
          <p className="text-[11px] text-text-dim">{user.email}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {user.country && (
              <span className="tag-pill">
                <Globe className="w-2.5 h-2.5 inline mr-1" />
                {user.country}
              </span>
            )}
            <span className="tag-pill">
              <Users className="w-2.5 h-2.5 inline mr-1" />
              {formatNumber(user.followers)}
            </span>
            <span className="tag-pill">
              <Calendar className="w-2.5 h-2.5 inline mr-1" />
              {new Date(user.createdAt).getFullYear()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-text hover:border-text-dim transition-colors"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-text hover:border-text-dim transition-colors">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="text-5xl shrink-0">
              {getPersonalityEmoji(personality.archetype)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-medium">
                {personality.archetype}
              </p>
              <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                {personality.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {personality.traits.map((trait) => (
                  <span key={trait} className="tag-pill">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
            {[
              {
                icon: Target,
                label: "Score",
                value: `${personality.score}/100`,
              },
              {
                icon: Zap,
                label: "Energy",
                value: `${personality.energyLevel}%`,
              },
              {
                icon: Star,
                label: "Uniqueness",
                value: `${personality.uniqueness}%`,
              },
              { icon: Award, label: "Mood", value: personality.dominantMood },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-3 rounded-lg bg-surface-light"
              >
                <s.icon className="w-3.5 h-3.5 text-text-dim mx-auto mb-1.5" />
                <p className="text-sm text-text nums">{s.value}</p>
                <p className="text-[10px] text-text-dim uppercase tracking-wide mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            icon: Clock,
            label: "Minutes",
            value: formatNumber(stats.totalMinutes),
          },
          {
            icon: Music,
            label: "Tracks",
            value: formatNumber(stats.totalTracks),
          },
          {
            icon: Users,
            label: "Artists",
            value: formatNumber(stats.uniqueArtists),
          },
          { icon: TrendingUp, label: "Genres", value: stats.uniqueGenres },
          { icon: Target, label: "Peak Hour", value: `${stats.peakHour}:00` },
          { icon: Calendar, label: "Streak", value: `${stats.streakDays}d` },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <stat.icon className="w-4 h-4 text-text-dim mx-auto mb-2" />
            <p className="text-xl font-light nums text-text">{stat.value}</p>
            <p className="text-[10px] text-text-dim uppercase tracking-wide mt-0.5">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-label">Top Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {genres.slice(0, 5).map((genre, i) => (
              <div key={genre.name} className="flex items-center gap-3">
                <span className="text-[11px] text-text-dim w-4 text-right">
                  {i + 1}
                </span>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: genre.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text capitalize">
                      {genre.name}
                    </span>
                    <span className="text-[11px] text-text-dim">
                      {genre.value}
                    </span>
                  </div>
                  <div className="h-0.5 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(genre.value / genres[0].value) * 100}%`,
                        backgroundColor: genre.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="section-label">Shareable Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {getPersonalityEmoji(personality.archetype)}
              </span>
              <div>
                <p className="text-sm text-text font-medium">
                  {user.displayName}
                </p>
                <p className="text-[11px] text-primary">
                  {personality.archetype}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
              {[
                { label: "Minutes", value: formatNumber(stats.totalMinutes) },
                { label: "Artists", value: stats.uniqueArtists },
                { label: "Streak", value: `${stats.streakDays}d` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-sm text-text nums">{value}</p>
                  <p className="text-[10px] text-text-dim uppercase tracking-wide">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-text-dim text-right">
              stereodna.app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
