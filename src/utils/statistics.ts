// 統計計算ユーティリティ

export interface StatisticalSummary {
  mean: number
  median: number
  mode: number
  variance: number
  standardDeviation: number
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
  skewness: number
  kurtosis: number
  confidenceInterval95: {
    lower: number
    upper: number
  }
}

/**
 * 配列の基本統計量を計算
 */
export const calculateStatistics = (data: number[]): StatisticalSummary => {
  if (data.length === 0) {
    throw new Error('データが空です')
  }

  const sortedData = [...data].sort((a, b) => a - b)
  const n = data.length

  // 基本統計量
  const sum = data.reduce((acc, val) => acc + val, 0)
  const mean = sum / n
  
  // 中央値
  const median = n % 2 === 0
    ? (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2
    : sortedData[Math.floor(n / 2)]

  // 最頻値（モード）
  const frequency: Record<number, number> = {}
  data.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1
  })
  const mode = Number(Object.keys(frequency).reduce((a, b) => 
    frequency[Number(a)] > frequency[Number(b)] ? a : b
  ))

  // 分散と標準偏差
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
  const standardDeviation = Math.sqrt(variance)

  // 最小値・最大値・範囲
  const min = sortedData[0]
  const max = sortedData[n - 1]
  const range = max - min

  // 四分位数
  const q1Index = Math.floor(n * 0.25)
  const q3Index = Math.floor(n * 0.75)
  const q1 = n >= 4 ? sortedData[q1Index] : min
  const q3 = n >= 4 ? sortedData[q3Index] : max
  const iqr = q3 - q1

  // 歪度（スキューネス）
  const skewness = n > 2 
    ? (data.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 3), 0) / n)
    : 0

  // 尖度（クルトシス）
  const kurtosis = n > 3
    ? (data.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 4), 0) / n) - 3
    : 0

  // 95%信頼区間
  const standardError = standardDeviation / Math.sqrt(n)
  const tValue = 1.96 // 大標本での近似値
  const marginOfError = tValue * standardError
  const confidenceInterval95 = {
    lower: mean - marginOfError,
    upper: mean + marginOfError
  }

  return {
    mean,
    median,
    mode,
    variance,
    standardDeviation,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis,
    confidenceInterval95
  }
}

/**
 * ヒストグラム用のビン計算
 */
export const calculateHistogramBins = (
  data: number[], 
  binCount?: number
): { binEdges: number[], binCounts: number[], binCenters: number[] } => {
  if (data.length === 0) {
    return { binEdges: [], binCounts: [], binCenters: [] }
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  
  // Sturges' rule または Square-root choice を使用
  const defaultBinCount = Math.max(
    Math.ceil(Math.log2(data.length) + 1), // Sturges' rule
    Math.ceil(Math.sqrt(data.length)) // Square-root choice
  )
  
  const bins = binCount || Math.min(50, Math.max(5, defaultBinCount))
  const binWidth = (max - min) / bins
  
  const binEdges: number[] = []
  const binCenters: number[] = []
  const binCounts: number[] = new Array(bins).fill(0)
  
  // ビンの境界を計算
  for (let i = 0; i <= bins; i++) {
    binEdges.push(min + i * binWidth)
  }
  
  // ビンの中心を計算
  for (let i = 0; i < bins; i++) {
    binCenters.push(binEdges[i] + binWidth / 2)
  }
  
  // データをビンに分類
  data.forEach(value => {
    let binIndex = Math.floor((value - min) / binWidth)
    // 最大値の場合は最後のビンに入れる
    if (binIndex >= bins) binIndex = bins - 1
    if (binIndex < 0) binIndex = 0
    binCounts[binIndex]++
  })
  
  return { binEdges, binCounts, binCenters }
}

/**
 * パーセンタイル計算
 */
export const calculatePercentile = (data: number[], percentile: number): number => {
  if (data.length === 0) return 0
  if (percentile < 0 || percentile > 100) {
    throw new Error('パーセンタイルは0-100の範囲で指定してください')
  }

  const sortedData = [...data].sort((a, b) => a - b)
  const index = (percentile / 100) * (sortedData.length - 1)
  
  if (Number.isInteger(index)) {
    return sortedData[index]
  } else {
    const lowerIndex = Math.floor(index)
    const upperIndex = Math.ceil(index)
    const weight = index - lowerIndex
    return sortedData[lowerIndex] * (1 - weight) + sortedData[upperIndex] * weight
  }
}

/**
 * 外れ値検出（IQR method）
 */
export const detectOutliers = (data: number[]): {
  outliers: number[]
  lowerBound: number
  upperBound: number
  cleanData: number[]
} => {
  const stats = calculateStatistics(data)
  const lowerBound = stats.q1 - 1.5 * stats.iqr
  const upperBound = stats.q3 + 1.5 * stats.iqr
  
  const outliers: number[] = []
  const cleanData: number[] = []
  
  data.forEach(value => {
    if (value < lowerBound || value > upperBound) {
      outliers.push(value)
    } else {
      cleanData.push(value)
    }
  })
  
  return { outliers, lowerBound, upperBound, cleanData }
}

/**
 * 正規性検定（Shapiro-Wilk test の簡易版）
 */
export const testNormality = (data: number[]): {
  isNormal: boolean
  pValue: number
  interpretation: string
} => {
  if (data.length < 3) {
    return {
      isNormal: false,
      pValue: 0,
      interpretation: 'サンプルサイズが小さすぎます（最小3個必要）'
    }
  }

  const stats = calculateStatistics(data)
  
  // 簡易的な正規性判定（歪度と尖度による）
  const skewnessThreshold = 2
  const kurtosisThreshold = 7
  
  const isSkewnessNormal = Math.abs(stats.skewness) < skewnessThreshold
  const isKurtosisNormal = Math.abs(stats.kurtosis) < kurtosisThreshold
  
  const isNormal = isSkewnessNormal && isKurtosisNormal
  
  // 簡易的なp値計算（実際のShapiro-Wilk testは複雑）
  const deviationFromNormal = Math.abs(stats.skewness) + Math.abs(stats.kurtosis) / 3
  const pValue = Math.max(0.001, 1 - Math.min(0.999, deviationFromNormal / 5))
  
  let interpretation = ''
  if (isNormal) {
    interpretation = '正規分布に近いと判定されました'
  } else {
    const reasons = []
    if (!isSkewnessNormal) {
      reasons.push(stats.skewness > 0 ? '右に偏った分布' : '左に偏った分布')
    }
    if (!isKurtosisNormal) {
      reasons.push(stats.kurtosis > 0 ? '尖った分布' : '平坦な分布')
    }
    interpretation = `正規分布ではありません（${reasons.join('、')}）`
  }
  
  return { isNormal, pValue, interpretation }
}

/**
 * 二つのデータセットの比較
 */
export const compareDatasets = (
  data1: number[], 
  data2: number[], 
  labels: [string, string] = ['データセット1', 'データセット2']
): {
  stats1: StatisticalSummary
  stats2: StatisticalSummary
  comparison: {
    meanDifference: number
    meanDifferencePercent: number
    significantDifference: boolean
    interpretation: string
  }
} => {
  const stats1 = calculateStatistics(data1)
  const stats2 = calculateStatistics(data2)
  
  const meanDifference = stats2.mean - stats1.mean
  const meanDifferencePercent = stats1.mean !== 0 ? (meanDifference / stats1.mean) * 100 : 0
  
  // 簡易的な有意差判定（t検定の近似）
  const pooledStd = Math.sqrt(
    ((data1.length - 1) * stats1.variance + (data2.length - 1) * stats2.variance) / 
    (data1.length + data2.length - 2)
  )
  const standardError = pooledStd * Math.sqrt(1 / data1.length + 1 / data2.length)
  const tStat = Math.abs(meanDifference) / standardError
  const significantDifference = tStat > 1.96 // 95%信頼水準
  
  let interpretation = ''
  if (significantDifference) {
    const better = meanDifference > 0 ? labels[1] : labels[0]
    interpretation = `${better}が統計的に有意に優れています（差: ${Math.abs(meanDifferencePercent).toFixed(1)}%）`
  } else {
    interpretation = '統計的に有意な差は認められません'
  }
  
  return {
    stats1,
    stats2,
    comparison: {
      meanDifference,
      meanDifferencePercent,
      significantDifference,
      interpretation
    }
  }
}