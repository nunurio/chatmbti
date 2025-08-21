import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TypeDescriptionProps {
  type: string
  confidence: number
  className?: string
}

const mbtiData = {
  INTJ: { name: 'Architect', description: 'Strategic and independent thinkers with a knack for planning and execution.' },
  ENFP: { name: 'Campaigner', description: 'Enthusiastic and creative individuals who inspire others with their energy.' },
  ISFJ: { name: 'Protector', description: 'Warm and dedicated caregivers who prioritize harmony and support.' },
  ESTP: { name: 'Entrepreneur', description: 'Bold and practical action-takers who excel in dynamic environments.' },
  INFP: { name: 'Mediator', description: 'Idealistic and adaptable dreamers driven by personal values.' },
  INTP: { name: 'Thinker', description: 'Innovative and logical problem-solvers who value knowledge.' },
  ENTJ: { name: 'Commander', description: 'Bold leaders who focus on efficiency and long-term vision.' },
  ENTP: { name: 'Debater', description: 'Quick-witted innovators who enjoy intellectual challenges.' },
  INFJ: { name: 'Advocate', description: 'Insightful individuals dedicated to helping others realize their potential.' },
  ENFJ: { name: 'Protagonist', description: 'Inspiring leaders who are passionate about helping others grow.' },
  ISTJ: { name: 'Logistician', description: 'Practical and fact-minded individuals who are reliable and responsible.' },
  ESFJ: { name: 'Consul', description: 'Caring and social people who are always ready to help.' },
  ISTP: { name: 'Virtuoso', description: 'Bold and practical experimenters who master tools and techniques.' },
  ISFP: { name: 'Adventurer', description: 'Flexible and charming artists who are always ready for new possibilities.' },
  ESFP: { name: 'Entertainer', description: 'Spontaneous and enthusiastic people who love life and people.' },
}

const letterMeanings = {
  I: 'Introverted',
  E: 'Extraverted', 
  N: 'iNtuitive',
  S: 'Sensing',
  T: 'Thinking',
  F: 'Feeling',
  J: 'Judging',
  P: 'Perceiving'
}

export function TypeDescription({ type, confidence, className }: TypeDescriptionProps) {
  const typeInfo = mbtiData[type as keyof typeof mbtiData] || { name: 'Unknown', description: 'Unknown type' }
  
  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 80) return 'default'
    if (confidence >= 60) return 'secondary'
    return 'outline'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-blue-600'
    return 'text-yellow-600'
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          {type}
        </CardTitle>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-muted-foreground">
            {typeInfo.name}
          </h3>
          <Badge 
            variant={getConfidenceVariant(confidence)}
            className={cn("text-sm", getConfidenceColor(confidence))}
          >
            {confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground leading-relaxed">
          {typeInfo.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 pt-4">
          {type.split('').map((letter, index) => (
            <div key={index} className="flex items-center justify-center p-2 bg-muted rounded-lg">
              <span className="font-medium text-sm">
                <strong>{letter}</strong> - {letterMeanings[letter as keyof typeof letterMeanings]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}