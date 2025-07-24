export interface Player {
  team: string
  name: string
  PA: number    // Plate Appearances
  '1B': number  // Singles
  '2B': number  // Doubles
  '3B': number  // Triples
  HR: number    // Home Runs
  SO: number    // Strikeouts
  BB: number    // Walks
  OUT_OTHER: number // Other outs
}

export interface PlayerStats {
  player: Player
  battingAverage: number
  onBasePercentage: number
  sluggingPercentage: number
  ops: number
}

export type TeamName = 
  | 'Giants' 
  | 'Tigers' 
  | 'Dragons' 
  | 'Swallows' 
  | 'BayStars' 
  | 'Carp'
  | 'Lions' 
  | 'Eagles' 
  | 'Marines' 
  | 'Fighters' 
  | 'Buffaloes' 
  | 'Hawks'