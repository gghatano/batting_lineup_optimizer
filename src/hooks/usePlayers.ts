import { useQuery } from '@tanstack/react-query'
import Papa from 'papaparse'
import { Player } from '../types/Player'
import { getProcessedDataSource, config } from '../config'

interface CsvRow {
  チーム: string
  背番号: string
  選手名: string
  打率: string
  試合: string
  打席数: string
  打数: string
  得点: string
  安打: string
  二塁打: string
  三塁打: string
  本塁打: string
  塁打: string
  打点: string
  盗塁: string
  盗塁刺: string
  犠打: string
  犠飛: string
  四球: string
  敬遠: string
  死球: string
  三振: string
  併殺打: string
  出塁率: string
  長打率: string
}

const fetchCsvData = async (customUrl?: string): Promise<Player[]> => {
  const csvUrl = getProcessedDataSource(customUrl)
  
  try {
    const response = await fetch(csvUrl, {
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
      },
      // Google Sheetsの場合、CORSエラーを避けるためのオプション
      mode: (config.dataMode === 'remote' || customUrl) ? 'cors' : 'same-origin',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }
    
    const csvText = await response.text()
    
    if (!csvText.trim()) {
      throw new Error('CSV data is empty')
    }
  
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0]?.message || 'Unknown error'}`))
          return
        }
        
        try {
          const players: Player[] = results.data.map((row: CsvRow) => ({
            チーム: row.チーム,
            背番号: parseInt(row.背番号, 10),
            選手名: row.選手名,
            打率: parseFloat(row.打率),
            試合: parseInt(row.試合, 10),
            打席数: parseInt(row.打席数, 10),
            打数: parseInt(row.打数, 10),
            得点: parseInt(row.得点, 10),
            安打: parseInt(row.安打, 10),
            二塁打: parseInt(row.二塁打, 10),
            三塁打: parseInt(row.三塁打, 10),
            本塁打: parseInt(row.本塁打, 10),
            塁打: parseInt(row.塁打, 10),
            打点: parseInt(row.打点, 10),
            盗塁: parseInt(row.盗塁, 10),
            盗塁刺: parseInt(row.盗塁刺, 10),
            犠打: parseInt(row.犠打, 10),
            犠飛: parseInt(row.犠飛, 10),
            四球: parseInt(row.四球, 10),
            敬遠: parseInt(row.敬遠, 10),
            死球: parseInt(row.死球, 10),
            三振: parseInt(row.三振, 10),
            併殺打: parseInt(row.併殺打, 10),
            出塁率: parseFloat(row.出塁率),
            長打率: parseFloat(row.長打率)
          }))
          
          // Validate data integrity
          const invalidPlayers = players.filter(player => 
            !player.チーム || isNaN(player.背番号) || isNaN(player.打率) || isNaN(player.打席数) || 
            isNaN(player.安打) || isNaN(player.本塁打) || isNaN(player.三振) || 
            isNaN(player.四球) || isNaN(player.出塁率) || isNaN(player.長打率) ||
            !player.選手名
          )
          
          if (invalidPlayers.length > 0) {
            reject(new Error(`Invalid player data found: ${invalidPlayers.length} players`))
            return
          }
          
          resolve(players)
        } catch (error) {
          reject(new Error(`Data processing error: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`))
      }
    })
  })
  
  } catch (networkError) {
    throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Failed to fetch data'}`)
  }
}

export const usePlayers = (customUrl?: string) => {
  return useQuery({
    queryKey: ['players', config.dataMode, getProcessedDataSource(customUrl), customUrl],
    queryFn: () => fetchCsvData(customUrl),
    staleTime: (config.dataMode === 'remote' || customUrl) ? 2 * 60 * 1000 : 5 * 60 * 1000, // リモートは2分、ローカルは5分
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (config.dataMode === 'remote' || customUrl) ? 3 : 2, // リモートはリトライ回数を増やす
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数バックオフ
    // TanStack Query v5では retryCondition は削除されているためコメントアウト
    // retryCondition: (error: Error) => {
    //   if (config.dataMode === 'remote') {
    //     return error.message.includes('Network error') || 
    //            error.message.includes('Failed to fetch') ||
    //            error.message.includes('timeout')
    //   }
    //   return true
    // }
  })
}