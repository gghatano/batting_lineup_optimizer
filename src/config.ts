// データソース設定
export const config = {
  dataMode: import.meta.env.VITE_DATA_MODE as 'local' | 'remote',
  localCsvPath: '/sample_players.csv',
  remoteCsvUrl: '', // GitHub Actionsで設定される
}