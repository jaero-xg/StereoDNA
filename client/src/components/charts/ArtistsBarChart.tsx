import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import type { ArtistRanking } from '@/types'

interface ArtistsBarChartProps {
  data: ArtistRanking[]
}

export default function ArtistsBarChart({ data }: ArtistsBarChartProps) {
  const chartData = data.slice(0, 8).map((item, i) => ({
    name: item.artist.name.length > 15 ? item.artist.name.slice(0, 15) + '...' : item.artist.name,
    plays: item.playCount,
    color: i === 0 ? '#7c3aed' : i === 1 ? '#06b6d4' : i === 2 ? '#ec4899' : '#475569',
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Artists</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#94a3b8"
              fontSize={12}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
              formatter={(value: number) => [`${value} plays`, 'Plays']}
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
  )
}
