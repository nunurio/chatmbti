import { TypeDescription } from './TypeDescription'
import { ScoreChart } from './ScoreChart'
import { RecommendationCard } from './RecommendationCard'
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { RotateCcw, Save, MessageCircle } from "lucide-react"

interface MBTIResult {
  type: string
  confidence: number
  scores: {
    EI: number
    SN: number
    TF: number
    JP: number
  }
}

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

interface ResultDisplayProps {
  result: MBTIResult
  recommendations: Recommendation[]
  onSave?: (result: MBTIResult) => void
  onRetakeTest?: () => void
  onStartChat?: () => void
  onPersonaSelect?: (persona: Persona) => void
  className?: string
}

export function ResultDisplay({
  result,
  recommendations,
  onSave,
  onRetakeTest,
  onStartChat,
  onPersonaSelect,
  className
}: ResultDisplayProps) {
  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Your MBTI Results</h1>
        <p className="text-muted-foreground">
          Discover your personality type and get personalized chat recommendations
        </p>
      </div>

      <TypeDescription 
        type={result.type} 
        confidence={result.confidence} 
        className="animate-in slide-in-from-bottom-4 duration-700" 
      />
      
      <ScoreChart 
        scores={result.scores} 
        className="animate-in slide-in-from-bottom-4 duration-700 delay-150" 
      />
      
      <RecommendationCard 
        recommendations={recommendations} 
        userType={result.type}
        onSelect={onPersonaSelect}
        className="animate-in slide-in-from-bottom-4 duration-700 delay-300"
      />
      
      <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-450">
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={() => onSave?.(result)}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Result
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onRetakeTest?.()}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Test
          </Button>
          
          <Separator orientation="vertical" className="hidden sm:block h-6" />
          
          <Button 
            onClick={() => onStartChat?.()}
            className="w-full sm:flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Chat
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Based on the 16-personality model • Learn more about your type characteristics
        </p>
      </div>
    </div>
  )
}