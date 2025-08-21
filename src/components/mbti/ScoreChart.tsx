import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ScoreChartProps {
  scores: {
    EI: number  // -100 to 100
    SN: number  // -100 to 100  
    TF: number  // -100 to 100
    JP: number  // -100 to 100
  }
  className?: string
}

const dimensionData = {
  EI: { negative: 'Extraversion', positive: 'Introversion', shortNeg: 'E', shortPos: 'I' },
  SN: { negative: 'Sensing', positive: 'iNtuition', shortNeg: 'S', shortPos: 'N' },
  TF: { negative: 'Thinking', positive: 'Feeling', shortNeg: 'T', shortPos: 'F' },
  JP: { negative: 'Judging', positive: 'Perceiving', shortNeg: 'J', shortPos: 'P' },
}

export function ScoreChart({ scores, className }: ScoreChartProps) {
  const getDominantPreference = (score: number, dimension: keyof typeof dimensionData) => {
    if (score > 0) {
      return dimensionData[dimension].positive
    } else {
      return dimensionData[dimension].negative
    }
  }

  const getAbsolutePercentage = (score: number) => {
    return Math.abs(score)
  }

  const getIntensityColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-primary/90 text-primary-foreground'
    if (percentage >= 50) return 'bg-primary/60 text-primary-foreground'  
    if (percentage >= 30) return 'bg-primary/40 text-foreground'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Personality Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table role="table" className="w-full">
            <thead>
              <tr role="row" className="border-b">
                <th role="columnheader" className="text-left py-2 px-4 font-semibold">Dimension</th>
                <th role="columnheader" className="text-center py-2 px-4 font-semibold">Score</th>
                <th role="columnheader" className="text-left py-2 px-4 font-semibold">Preference</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scores).map(([dimension, score]) => {
                const typedDimension = dimension as keyof typeof dimensionData
                const preference = getDominantPreference(score, typedDimension)
                const percentage = getAbsolutePercentage(score)
                const isStronger = Math.abs(score) > 0
                const dimData = dimensionData[typedDimension]
                
                return (
                  <tr key={dimension} role="row" className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div data-testid={`dimension-${dimension}`} className={isStronger ? 'border-primary' : ''}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{dimData.negative}</span>
                          <span className="mx-2 text-muted-foreground">vs</span>
                          <span className="text-sm">{dimData.positive}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                          <span>({dimData.shortNeg})</span>
                          <span>({dimData.shortPos})</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant="secondary" 
                        className={cn("font-mono", getIntensityColor(percentage))}
                      >
                        {percentage}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-medium">{preference}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({score > 0 ? dimData.shortPos : dimData.shortNeg})
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}