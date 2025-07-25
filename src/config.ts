export const config = {
  dataMode: (import.meta.env.VITE_DATA_MODE as 'local' | 'remote') || 'local',
  csvUrl: {
    local: '/data/sample_data.csv',
    remote: import.meta.env.VITE_REMOTE_CSV_URL || ''
  }
} as const

export const getDataSource = () => {
  return config.dataMode === 'local' 
    ? config.csvUrl.local 
    : config.csvUrl.remote
}

// Google Sheets公開URL → CSV形式URL変換
export const convertGoogleSheetsUrl = (url: string): string => {
  // Google SheetsのURLをCSV出力形式に変換
  // 例: https://docs.google.com/spreadsheets/d/[ID]/edit#gid=0
  // →  https://docs.google.com/spreadsheets/d/[ID]/export?format=csv&gid=0
  
  if (url.includes('docs.google.com/spreadsheets')) {
    // URLからスプレッドシートIDを抽出
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (match) {
      const spreadsheetId = match[1]
      // gid（シートID）を抽出（デフォルトは0）
      const gidMatch = url.match(/[#&]gid=([0-9]+)/)
      const gid = gidMatch ? gidMatch[1] : '0'
      
      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`
    }
  }
  
  // 既にCSV形式のURLまたは他のURLの場合はそのまま返す
  return url
}

// データソース取得（Google Sheets URL変換対応）
export const getProcessedDataSource = (customUrl?: string): string => {
  if (customUrl) {
    return convertGoogleSheetsUrl(customUrl)
  }
  const source = getDataSource()
  return config.dataMode === 'remote' ? convertGoogleSheetsUrl(source) : source
}