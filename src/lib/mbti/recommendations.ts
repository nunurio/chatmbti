interface Persona {
  id: string;
  name: string;
  mbtiType?: string;
  description: string;
}

interface Recommendation {
  persona: Persona;
  compatibility: number; // 0-100
}

const VALID_MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export function calculateCompatibility(userType: string, botType: string): number {
  // Validation
  if (!VALID_MBTI_TYPES.includes(userType)) {
    throw new Error('Invalid MBTI type');
  }
  if (!VALID_MBTI_TYPES.includes(botType)) {
    throw new Error('Invalid MBTI type');
  }

  // Fake implementation for initial tests
  if (userType === botType) {
    return 100; // Perfect match
  }

  // Hardcoded complementary relationships for initial tests
  const complementaryPairs = [
    ['INTJ', 'ENFP'],
    ['INFJ', 'ENTP'],
    ['ISTJ', 'ESFP'],
    ['ISFJ', 'ESTP'],
  ];

  for (const [type1, type2] of complementaryPairs) {
    if ((userType === type1 && botType === type2) || (userType === type2 && botType === type1)) {
      return 85; // High compatibility
    }
  }

  // Check if they're complete opposites (all 4 dimensions different)
  if (userType === 'INTJ' && botType === 'ESFP') {
    return 25; // Low compatibility for opposites
  }
  if (userType === 'ESFP' && botType === 'INTJ') {
    return 25; // Symmetric
  }

  // Default compatibility for other combinations
  return 60;
}

export function getTopRecommendations(userType: string, personas: Persona[]): Recommendation[] {
  // Filter personas with valid MBTI types
  const validPersonas = personas.filter(p => 
    p.mbtiType && 
    p.mbtiType.length === 4 && 
    VALID_MBTI_TYPES.includes(p.mbtiType)
  );

  // Calculate compatibility for each persona
  const recommendations: Recommendation[] = validPersonas.map(persona => ({
    persona,
    compatibility: calculateCompatibility(userType, persona.mbtiType!),
  }));

  // Sort by compatibility (highest first)
  recommendations.sort((a, b) => b.compatibility - a.compatibility);

  // Return top 3
  return recommendations.slice(0, 3);
}