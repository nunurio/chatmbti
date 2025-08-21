import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Persona {
  id: string
  name: string
  mbtiType?: string
  description: string
}

interface Recommendation {
  persona: Persona
  compatibility: number
}

interface RecommendationCardProps {
  recommendations: Recommendation[]
  userType: string
  onSelect?: (persona: Persona) => void
  className?: string
}

export function RecommendationCard({ 
  recommendations, 
  userType, 
  onSelect, 
  className 
}: RecommendationCardProps) {
  if (recommendations.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No compatible personas found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 90) return 'bg-green-500 text-white'
    if (compatibility >= 80) return 'bg-green-400 text-white'
    if (compatibility >= 70) return 'bg-blue-500 text-white'
    if (compatibility >= 60) return 'bg-blue-400 text-white'
    return 'bg-gray-500 text-white'
  }

  const getRankIcon = (index: number) => {
    const icons = ['🥇', '🥈', '🥉']
    return icons[index] || `${index + 1}.`
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Recommended Chat Personas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on your {userType} personality type
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div 
            key={rec.persona.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getRankIcon(index)}</span>
                <div>
                  <h3 className="font-semibold">{rec.persona.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {rec.persona.mbtiType}
                    </Badge>
                    <Badge 
                      className={cn("text-xs font-mono", getCompatibilityColor(rec.compatibility))}
                    >
                      {rec.compatibility}% match
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pl-8">
                {rec.persona.description}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 shrink-0"
              onClick={() => onSelect?.(rec.persona)}
            >
              Select
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}