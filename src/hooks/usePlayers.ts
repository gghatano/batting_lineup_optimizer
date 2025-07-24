import { useQuery } from '@tanstack/react-query'
import Papa from 'papaparse'
import { Player } from '../types/Player'
import { getDataSource } from '../config'

interface CsvRow {
  team: string
  name: string
  PA: string
  '1B': string
  '2B': string
  '3B': string
  HR: string
  SO: string
  BB: string
  OUT_OTHER: string
}

const fetchCsvData = async (): Promise<Player[]> => {
  const csvUrl = getDataSource()
  
  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`)
  }
  
  const csvText = await response.text()
  
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
            team: row.team,
            name: row.name,
            PA: parseInt(row.PA, 10),
            '1B': parseInt(row['1B'], 10),
            '2B': parseInt(row['2B'], 10),
            '3B': parseInt(row['3B'], 10),
            HR: parseInt(row.HR, 10),
            SO: parseInt(row.SO, 10),
            BB: parseInt(row.BB, 10),
            OUT_OTHER: parseInt(row.OUT_OTHER, 10)
          }))
          
          // Validate data integrity
          const invalidPlayers = players.filter(player => 
            isNaN(player.PA) || isNaN(player['1B']) || isNaN(player['2B']) || 
            isNaN(player['3B']) || isNaN(player.HR) || isNaN(player.SO) || 
            isNaN(player.BB) || isNaN(player.OUT_OTHER) ||
            !player.team || !player.name
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
}

export const usePlayers = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: fetchCsvData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    retry: 2,
    retryDelay: 1000
  })
}