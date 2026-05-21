import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { getHeatmapColor } from '@/lib/utils'
import type { HeatmapData } from '@/types'

interface ListeningHeatmapProps {
  data: HeatmapData[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function ListeningHeatmap({ data }: ListeningHeatmapProps) {
  const heatmapMatrix = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    const maxCount = Math.max(...data.map(d => d.count), 1)

    data.forEach(d => {
      const date = new Date(d.date)
      const day = date.getDay()
      const hour = d.hour
      if (matrix[day] && matrix[day][hour] !== undefined) {
        matrix[day][hour] = d.count / maxCount
      }
    })

    return matrix
  }, [data])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Listening Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-12" />
              {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                <div key={hour} className="flex-1 text-center text-xs text-text-dim">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="space-y-1">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-1">
                  <div className="w-10 text-xs text-text-muted text-right pr-2">
                    {day}
                  </div>
                  <div className="flex-1 flex gap-1">
                    {HOURS.map(hour => {
                      const intensity = heatmapMatrix[dayIndex]?.[hour] || 0
                      return (
                        <motion.div
                          key={hour}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: dayIndex * 0.05 + hour * 0.01 }}
                          className={`flex-1 aspect-square rounded-sm ${getHeatmapColor(intensity)}`}
                          title={`${day} ${hour}:00 - ${Math.round(intensity * 100)}% activity`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-xs text-text-dim">Less</span>
              <div className="flex gap-1">
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${getHeatmapColor(level)}`}
                  />
                ))}
              </div>
              <span className="text-xs text-text-dim">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
