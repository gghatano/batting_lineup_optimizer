// 実際の野球統計に基づいた進塁確率データ
export interface AdvanceProbability {
  outs: number
  probability: number
}

export interface SituationAdvance {
  [key: number]: number // アウト数をキーとした確率
}

// 提供されたデータに基づく進塁確率テーブル
export const ADVANCE_PROBABILITIES = {
  // 三塁走者がいて "三振以外のアウト" の場合の得点確率
  THIRD_BASE_ON_OUT: {
    0: 0.43, // 0アウト時
    1: 0.41, // 1アウト時
    2: 0.00, // 2アウト時（データなし）
    average: 0.42
  },
  
  // 二塁走者がいて打者がシングルの場合の得点確率
  SECOND_BASE_ON_SINGLE: {
    0: 0.52, // 0アウト時
    1: 0.59, // 1アウト時
    2: 0.66, // 2アウト時
    average: 0.57
  },
  
  // 一塁走者がいて打者が二塁打の場合の得点確率
  FIRST_BASE_ON_DOUBLE: {
    0: 0.71, // 0アウト時
    1: 0.73, // 1アウト時
    2: 0.81, // 2アウト時
    average: 0.75
  }
} as const

// 追加の進塁確率データ（一般的な野球統計から推定）
export const ESTIMATED_ADVANCE_PROBABILITIES = {
  // 一塁走者がいて打者がシングル（二塁への進塁確率）
  FIRST_BASE_ON_SINGLE_TO_SECOND: {
    0: 0.95, // ほぼ確実に二塁へ
    1: 0.95,
    2: 0.95,
    average: 0.95
  },
  
  // 一塁走者がいて打者がシングル（三塁への進塁確率）
  FIRST_BASE_ON_SINGLE_TO_THIRD: {
    0: 0.40, // 0アウト時は保守的
    1: 0.50, // 1アウト時は積極的
    2: 0.70, // 2アウト時は非常に積極的
    average: 0.53
  },
  
  // 二塁走者がいて打者が二塁打（得点確率）
  SECOND_BASE_ON_DOUBLE: {
    0: 0.85,
    1: 0.87,
    2: 0.90,
    average: 0.87
  },
  
  // 三塁走者がいて打者がシングル（得点確率）
  THIRD_BASE_ON_SINGLE: {
    0: 0.95,
    1: 0.95,
    2: 0.95,
    average: 0.95
  }
} as const

// 打撃結果による進塁処理の詳細定義
export interface AdvanceResult {
  runs: number
  newRunners: number
}

// 実際の統計データに基づいた進塁計算
export const calculateAdvanceWithStatistics = (
  runners: number, // ビット列表現の走者状況
  hitType: 'single' | 'double' | 'triple' | 'homerun' | 'walk' | 'hbp' | 'strikeout' | 'out',
  outs: number
): AdvanceResult => {
  let runs = 0
  let newRunners = 0
  
  // 各塁の走者状況を確認
  const firstBase = (runners & 1) !== 0
  const secondBase = (runners & 2) !== 0
  const thirdBase = (runners & 4) !== 0
  
  switch (hitType) {
    case 'homerun':
      // ホームラン：全走者と打者が得点
      runs = 1 + (firstBase ? 1 : 0) + (secondBase ? 1 : 0) + (thirdBase ? 1 : 0)
      newRunners = 0
      break
      
    case 'triple':
      // 三塁打：全走者得点、打者は三塁へ
      runs = (firstBase ? 1 : 0) + (secondBase ? 1 : 0) + (thirdBase ? 1 : 0)
      newRunners = 4 // 三塁
      break
      
    case 'double':
      // 二塁打：統計データを使用
      if (firstBase) {
        // 一塁走者がいる場合の得点確率
        const prob = ADVANCE_PROBABILITIES.FIRST_BASE_ON_DOUBLE[outs as keyof typeof ADVANCE_PROBABILITIES.FIRST_BASE_ON_DOUBLE] || 
                     ADVANCE_PROBABILITIES.FIRST_BASE_ON_DOUBLE.average
        if (Math.random() < prob) {
          runs += 1
        } else {
          newRunners |= 4 // 三塁に残塁
        }
      }
      
      if (secondBase) {
        // 二塁走者は高確率で得点
        const prob = ESTIMATED_ADVANCE_PROBABILITIES.SECOND_BASE_ON_DOUBLE[outs as keyof typeof ESTIMATED_ADVANCE_PROBABILITIES.SECOND_BASE_ON_DOUBLE] || 
                     ESTIMATED_ADVANCE_PROBABILITIES.SECOND_BASE_ON_DOUBLE.average
        if (Math.random() < prob) {
          runs += 1
        } else {
          newRunners |= 4 // 三塁に残塁（稀）
        }
      }
      
      if (thirdBase) {
        // 三塁走者はほぼ確実に得点
        runs += 1
      }
      
      // 打者は二塁へ
      newRunners |= 2
      break
      
    case 'single':
      // 単打：統計データを使用
      if (firstBase) {
        // 一塁走者の進塁判定
        const toThirdProb = ESTIMATED_ADVANCE_PROBABILITIES.FIRST_BASE_ON_SINGLE_TO_THIRD[outs as keyof typeof ESTIMATED_ADVANCE_PROBABILITIES.FIRST_BASE_ON_SINGLE_TO_THIRD] || 
                           ESTIMATED_ADVANCE_PROBABILITIES.FIRST_BASE_ON_SINGLE_TO_THIRD.average
        
        if (Math.random() < toThirdProb) {
          newRunners |= 4 // 三塁へ
        } else {
          newRunners |= 2 // 二塁へ
        }
      }
      
      if (secondBase) {
        // 二塁走者の得点確率
        const prob = ADVANCE_PROBABILITIES.SECOND_BASE_ON_SINGLE[outs as keyof typeof ADVANCE_PROBABILITIES.SECOND_BASE_ON_SINGLE] || 
                     ADVANCE_PROBABILITIES.SECOND_BASE_ON_SINGLE.average
        if (Math.random() < prob) {
          runs += 1
        } else {
          newRunners |= 4 // 三塁に残塁
        }
      }
      
      if (thirdBase) {
        // 三塁走者はほぼ確実に得点
        const prob = ESTIMATED_ADVANCE_PROBABILITIES.THIRD_BASE_ON_SINGLE[outs as keyof typeof ESTIMATED_ADVANCE_PROBABILITIES.THIRD_BASE_ON_SINGLE] || 
                     ESTIMATED_ADVANCE_PROBABILITIES.THIRD_BASE_ON_SINGLE.average
        if (Math.random() < prob) {
          runs += 1
        } else {
          newRunners |= 4 // 三塁に残塁（稀）
        }
      }
      
      // 打者は一塁へ
      newRunners |= 1
      break
      
    case 'walk':
    case 'hbp':
      // 四球・死球：押し出しロジック
      if (firstBase && secondBase && thirdBase) {
        // 満塁：押し出し
        runs = 1
        newRunners = 7 // 満塁維持
      } else {
        // 走者を一つずつ押し出し
        if (thirdBase && secondBase && firstBase) {
          runs = 1 // 三塁走者得点
          newRunners = 7 // 満塁
        } else if (secondBase && firstBase) {
          newRunners = runners | 4 | 1 // 三塁と一塁に走者、打者も一塁
        } else if (firstBase) {
          newRunners = 3 // 二塁と一塁
        } else {
          newRunners = 1 // 一塁のみ
        }
      }
      break
      
    case 'out':
      // アウト（三振以外）：統計データを使用
      if (thirdBase && outs < 2) {
        // 2アウト時のアウトは3アウト目となりイニング終了なので得点なし
        // 0-1アウト時のみ犠牲フライ等による得点の可能性がある
        const probKey = outs as keyof typeof ADVANCE_PROBABILITIES.THIRD_BASE_ON_OUT
        const prob = ADVANCE_PROBABILITIES.THIRD_BASE_ON_OUT[probKey] !== undefined ? 
                     ADVANCE_PROBABILITIES.THIRD_BASE_ON_OUT[probKey] : 0
        
        if (Math.random() < prob) {
          runs += 1
        } else {
          newRunners |= 4 // 三塁に残塁
        }
      } else if (thirdBase) {
        // 2アウト時は走者そのまま（3アウト目でイニング終了）
        newRunners |= 4
      }
      
      // その他の走者は基本的に進塁しない（タッグアップ等は考慮しない）
      if (secondBase) newRunners |= 2
      if (firstBase) newRunners |= 1
      break
      
    case 'strikeout':
    default:
      // 三振：走者はそのまま
      newRunners = runners
      break
  }
  
  return { runs, newRunners }
}

// デバッグ用：進塁結果の詳細ログ
export const logAdvanceResult = (
  runners: number,
  hitType: string,
  outs: number,
  result: AdvanceResult
): void => {
  const formatRunners = (r: number): string => {
    const bases = []
    if (r & 1) bases.push('一塁')
    if (r & 2) bases.push('二塁')
    if (r & 4) bases.push('三塁')
    return bases.length > 0 ? bases.join('・') : '走者なし'
  }
  
  // 2アウト時のアウトでの得点は特にログ出力
  if (outs === 2 && hitType === 'out' && result.runs > 0) {
    console.warn(`⚠️ 異常: 2アウト時のアウトで得点発生: ${formatRunners(runners)} → ${hitType} → ${result.runs}得点`)
  }
  
  console.log(`🏃 進塁詳細: ${formatRunners(runners)} → ${hitType} (${outs}アウト) → ${result.runs}得点, ${formatRunners(result.newRunners)}`)
}