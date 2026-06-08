import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { spotifyApi } from "@/lib/api";
import {
  formatNumber,
  formatRelativeTime,
  getPersonalityEmoji,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import GenrePieChart from "@/components/charts/GenrePieChart";
import TrendsChart from "@/components/charts/TrendsChart";
import ArtistsBarChart from "@/components/charts/ArtistsBarChart";
import ListeningHeatmap from "@/components/heatmap/ListeningHeatmap";
import type { DashboardData, TimeRange } from "@/types";
import {
  Clock,
  Music,
  Users,
  Headphones,
  Flame,
  Brain,
  Sparkles,
  Disc,
  ChevronRight,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "All Time" },
];

export default function DashboardPage() {
  const { timeRange, setTimeRange } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        await spotifyApi.getRecentlyPlayed(50);
        const response = await spotifyApi.getDashboard(timeRange);
        setData(response.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-20 pb-12 px-4 text-center">
        <p className="text-text-dim text-sm">Failed to load dashboard data</p>
      </div>
    );
  }

  const {
    user,
    stats,
    topArtists,
    topTracks,
    recentlyPlayed,
    heatmap,
    genres,
    personality,
    roast,
    listeningTrends,
  } = data;

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-8 h-8 rounded-full opacity-90"
            />
          )}
          <div>
            <p className="text-sm text-text">{user.displayName}</p>
            <p className="text-[11px] text-text-dim">Music overview</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface rounded-lg p-1 w-fit">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 rounded-md text-xs tracking-wide transition-colors ${
                timeRange === range.value
                  ? "bg-surface-light text-text"
                  : "text-text-dim hover:text-text-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Headphones,
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
          { icon: Flame, label: "Streak", value: `${stats.streakDays}d` },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className="w-4 h-4 text-text-dim shrink-0" />
              <div>
                <p className="text-lg font-light nums text-text">
                  {stat.value}
                </p>
                <p className="text-[11px] text-text-dim uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="section-label">Top Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topArtists.slice(0, 5).map((artist, i) => (
                <div
                  key={artist.artist.name}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-surface-light transition-colors cursor-pointer group"
                >
                  <span className="w-5 text-[11px] text-text-dim text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-md bg-surface-light overflow-hidden shrink-0">
                    {artist.artist.image ? (
                      <img
                        src={artist.artist.image}
                        alt={artist.artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-4 h-4 text-text-dim m-auto mt-2.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">
                      {artist.artist.name}
                    </p>
                    <p className="text-[11px] text-text-dim">
                      {artist.playCount} plays
                    </p>
                  </div>
                  <p className="text-xs text-text-dim">
                    {artist.totalMinutes}m
                  </p>
                  <ChevronRight className="w-3.5 h-3.5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="section-label flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Personality
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <div className="text-5xl">
              {getPersonalityEmoji(personality.archetype)}
            </div>
            <div>
              <p className="text-sm text-text font-medium">
                {personality.archetype}
              </p>
              <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                {personality.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {personality.traits.map((trait) => (
                <span key={trait} className="tag-pill">
                  {trait}
                </span>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              {[
                { label: "Energy", value: personality.energyLevel },
                { label: "Uniqueness", value: personality.uniqueness },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-[11px] text-text-dim w-16 text-left">
                    {label}
                  </span>
                  <div className="flex-1 h-1 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-text-dim w-8 text-right">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Style", value: personality.listeningStyle },
                { label: "Peak", value: personality.timeOfDay },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-light rounded-lg p-2">
                  <p className="text-[10px] text-text-dim uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-xs text-text mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-text-dim" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="section-label">Music Taste Roast</span>
                {roast.severity}
              </div>
              <p className="text-sm text-text-muted italic leading-relaxed">
                "{roast.roast}"
              </p>
              <div className="flex gap-1.5 mt-2">
                {roast.categories.map((cat) => (
                  <span key={cat} className="tag-pill">
                    #{cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GenrePieChart data={genres} />
        <ArtistsBarChart data={topArtists} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListeningHeatmap data={heatmap} />
        <TrendsChart data={listeningTrends} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="section-label flex items-center gap-2">
            <Disc className="w-3.5 h-3.5" /> Top Tracks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {topTracks.slice(0, 6).map((track, i) => (
              <div
                key={track.track.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-light transition-colors group cursor-pointer"
              >
                <span className="w-4 text-[11px] text-text-dim text-right shrink-0">
                  {i + 1}
                </span>
                <div className="w-9 h-9 rounded-md bg-surface-light overflow-hidden shrink-0">
                  {track.track.albumArt ? (
                    <img
                      src={track.track.albumArt}
                      alt={track.track.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-4 h-4 text-text-dim m-auto mt-2.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">
                    {track.track.name}
                  </p>
                  <p className="text-[11px] text-text-dim truncate">
                    {track.track.artist}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-text-dim">
                    {track.playCount}×
                  </span>
                  {track.track.previewUrl && (
                    <Play className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="section-label flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Recently Played
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0.5">
            {recentlyPlayed.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-surface-light overflow-hidden shrink-0">
                  {item.track.albumArt ? (
                    <img
                      src={item.track.albumArt}
                      alt={item.track.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-3.5 h-3.5 text-text-dim m-auto mt-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">
                    {item.track.name}
                  </p>
                  <p className="text-[11px] text-text-dim truncate">
                    {item.track.artist}
                  </p>
                </div>
                <span className="text-[11px] text-text-dim shrink-0">
                  {formatRelativeTime(item.playedAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
