import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { getHeatmapColor } from "@/lib/utils";
import type { HeatmapData } from "@/types";

interface ListeningHeatmapProps {
  data: HeatmapData[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ListeningHeatmap({ data }: ListeningHeatmapProps) {
  const heatmapMatrix = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0),
    );
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    data.forEach((d) => {
      const date = new Date(d.date);
      const day = date.getDay();
      const hour = d.hour;
      if (matrix[day] && matrix[day][hour] !== undefined) {
        matrix[day][hour] = d.count / maxCount;
      }
    });

    return matrix;
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-widest text-text-dim font-normal">
          Listening Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-10" />
              {HOURS.filter((_, i) => i % 6 === 0).map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-left text-[10px] text-text-dim"
                  style={{ marginLeft: hour === 0 ? 0 : undefined }}
                >
                  {hour}h
                </div>
              ))}
            </div>

            <div className="space-y-0.5">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-1">
                  <div className="w-8 text-[10px] text-text-dim text-right pr-2 shrink-0">
                    {day}
                  </div>
                  <div className="flex-1 flex gap-0.5">
                    {HOURS.map((hour) => {
                      const intensity = heatmapMatrix[dayIndex]?.[hour] || 0;
                      return (
                        <div
                          key={hour}
                          className={`flex-1 aspect-square rounded-[2px] ${getHeatmapColor(intensity)}`}
                          title={`${day} ${hour}:00 — ${Math.round(intensity * 100)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-[10px] text-text-dim">less</span>
              <div className="flex gap-0.5">
                {[0, 0.25, 0.5, 0.75, 1].map((level) => (
                  <div
                    key={level}
                    className={`w-2.5 h-2.5 rounded-[2px] ${getHeatmapColor(level)}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-text-dim">more</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
