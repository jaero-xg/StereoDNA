import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState, TimeRange, DashboardData } from '@/types'

interface AppState extends AuthState {
  timeRange: TimeRange
  dashboardData: DashboardData | null
  isDashboardLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  setError: (error: string | null) => void
  setTimeRange: (range: TimeRange) => void
  setDashboardData: (data: DashboardData | null) => void
  setDashboardLoading: (value: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      error: null,
      timeRange: 'medium_term',
      dashboardData: null,
      isDashboardLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ isLoading: value }),
      setError: (error) => set({ error }),
      setTimeRange: (timeRange) => set({ timeRange }),
      setDashboardData: (dashboardData) => set({ dashboardData }),
      setDashboardLoading: (value) => set({ isDashboardLoading: value }),
      logout: () => {
        localStorage.removeItem('access_token')
        set({
          isAuthenticated: false,
          user: null,
          dashboardData: null,
          error: null,
        })
      },
    }),
    {
      name: 'stereodna-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        timeRange: state.timeRange,
      }),
    }
  )
)
