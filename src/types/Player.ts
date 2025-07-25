export interface Player {
  チーム: string
  背番号: number
  選手名: string
  打率: number
  試合: number
  打席数: number
  打数: number
  得点: number
  安打: number
  二塁打: number
  三塁打: number
  本塁打: number
  塁打: number
  打点: number
  盗塁: number
  盗塁刺: number
  犠打: number
  犠飛: number
  四球: number
  敬遠: number
  死球: number
  三振: number
  併殺打: number
  出塁率: number
  長打率: number
}

// チーム名の型定義
export type TeamName = string

export interface PlayerStats {
  player: Player
  battingAverage: number
  onBasePercentage: number
  sluggingPercentage: number
  ops: number
}