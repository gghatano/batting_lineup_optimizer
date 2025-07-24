export const config = {
  dataMode: (import.meta.env.VITE_DATA_MODE as 'local' | 'remote') || 'local',
  csvUrl: {
    local: '/data/sample_players.csv',
    remote: import.meta.env.VITE_REMOTE_CSV_URL || ''
  }
} as const

export const getDataSource = () => {
  return config.dataMode === 'local' 
    ? config.csvUrl.local 
    : config.csvUrl.remote
}