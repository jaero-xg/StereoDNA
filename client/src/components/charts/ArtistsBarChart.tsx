import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import type { ArtistRanking } from "@/types";

interface ArtistsBarChartProps {
  data: ArtistRanking[];
}

const COLORS = ["#1db954", "#06b6d4", "#a0a0a0", "#707070"];

export default function ArtistsBarChart({ data }: ArtistsBarChartProps) {
  const chartData = data.slice(0, 8).map((item, i) => ({
    name:
      item.artist.name.length > 15
        ? item.artist.name.slice(0, 15) + "..."
        : item.artist.name,
    plays: item.playCount,
    color: COLORS[Math.min(i, COLORS.length - 1)],
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Artists</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis type="number" stroke="#707070" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#a0a0a0"
              fontSize={12}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              formatter={(value: number) => [`${value} plays`, "Plays"]}
            />
            <Bar dataKey="plays" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
