export interface PersonalityParameters {
  // Communication style (0-100 scale)
  warmth: number;        // Cold (0) to Warm (100)
  formality: number;     // Casual (0) to Formal (100)
  brevity: number;       // Verbose (0) to Concise (100)
  humor: number;         // Serious (0) to Humorous (100)
  
  // Cognitive style
  analyticalDepth: number;  // Surface (0) to Deep (100)
  creativity: number;       // Conventional (0) to Creative (100)
  
  // Interaction style
  empathy: number;         // Detached (0) to Empathetic (100)
  assertiveness: number;   // Passive (0) to Assertive (100)
}

export interface MBTIParameterMapping {
  [mbtiType: string]: Partial<PersonalityParameters>;
}

export function validateParameters(params: PersonalityParameters): boolean {
  const parameterValues = Object.values(params);
  
  return parameterValues.every(value => 
    typeof value === 'number' && 
    value >= 0 && 
    value <= 100
  );
}

export function getDefaultParameters(): PersonalityParameters {
  return {
    warmth: 50,
    formality: 50,
    brevity: 50,
    humor: 50,
    analyticalDepth: 50,
    creativity: 50,
    empathy: 50,
    assertiveness: 50,
  };
}

const mbtiMappings: MBTIParameterMapping = {
  // Analysts
  'INTJ': {
    warmth: 30,           // Low warmth (introversion)
    formality: 60,        // Moderate formality
    brevity: 70,          // More concise
    humor: 25,            // Less humor (serious)
    analyticalDepth: 85,  // High analytical depth (thinking)
    creativity: 75,       // High creativity (intuition)
    empathy: 35,          // Lower empathy (thinking over feeling)
    assertiveness: 70,    // More assertive (judging)
  },
  
  // Campaigners
  'ENFP': {
    warmth: 85,           // High warmth (extraversion)
    formality: 25,        // Low formality (casual)
    brevity: 30,          // More verbose (enthusiastic)
    humor: 80,            // High humor
    analyticalDepth: 45,  // Moderate analytical depth
    creativity: 90,       // Very high creativity (intuition)
    empathy: 85,          // High empathy (feeling)
    assertiveness: 60,    // Moderate assertiveness (perceiving)
  },
  
  // Logisticians
  'ISTJ': {
    warmth: 45,           // Moderate warmth
    formality: 85,        // High formality
    brevity: 80,          // Concise
    humor: 20,            // Low humor (serious)
    analyticalDepth: 75,  // High analytical depth (thinking)
    creativity: 25,       // Lower creativity (sensing)
    empathy: 40,          // Moderate empathy
    assertiveness: 75,    // High assertiveness (judging)
  },
};

export function getMBTIDefaults(mbtiType: string): PersonalityParameters {
  const mapping = mbtiMappings[mbtiType];
  
  if (mapping) {
    // Merge with defaults to ensure all properties are present
    return {
      ...getDefaultParameters(),
      ...mapping,
    };
  }
  
  // Default to balanced for unknown types
  return getDefaultParameters();
}