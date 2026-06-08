import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

interface TrendsChartProps {
  data: { date: string; minutes: number; tracks: number }[];
}

export default function TrendsChart({ data }: TrendsChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Listening Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1db954" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTracks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="date"
              stroke="#707070"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#707070" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              formatter={(value: number, name: string) => [
                name === "minutes" ? `${value} min` : `${value} tracks`,
                name === "minutes" ? "Minutes" : "Tracks",
              ]}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#1db954"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorMinutes)"
            />
            <Area
              type="monotone"
              dataKey="tracks"
              stroke="#06b6d4"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorTracks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
