import type { PersonalityParameters } from './parameters';

function getWarmthDescription(warmth: number): string {
  if (warmth >= 67) return 'warm, friendly, and approachable';
  if (warmth <= 33) return 'professional and reserved';
  return 'balanced in warmth';
}

function getFormalityDescription(formality: number): string {
  if (formality >= 67) return 'formal and structured';
  if (formality <= 33) return 'casual, relaxed, and conversational';
  return 'moderately formal';
}

function getAnalyticalDepthDescription(analyticalDepth: number): string {
  if (analyticalDepth >= 67) return 'analytical, thorough, and detail-oriented';
  if (analyticalDepth <= 33) return 'focused on surface-level information';
  return 'balanced in analytical depth';
}

function getCreativityDescription(creativity: number): string {
  if (creativity >= 67) return 'creative and innovative';
  if (creativity <= 33) return 'conventional and practical';
  return 'moderately creative';
}

function getBrevityDescription(brevity: number): string {
  if (brevity >= 67) return 'concise and to-the-point';
  if (brevity <= 33) return 'verbose and detailed in explanations';
  return 'balanced in response length';
}

function getHumorDescription(humor: number): string {
  if (humor >= 67) return 'humorous and engaging';
  if (humor <= 33) return 'serious and professional';
  return 'moderately humorous when appropriate';
}

function getEmpathyDescription(empathy: number): string {
  if (empathy >= 67) return 'highly empathetic and understanding';
  if (empathy <= 33) return 'detached and objective';
  return 'appropriately empathetic';
}

function getAssertivenessDescription(assertiveness: number): string {
  if (assertiveness >= 67) return 'assertive and confident';
  if (assertiveness <= 33) return 'passive and accommodating';
  return 'moderately assertive';
}

export function generateSystemPrompt(
  params: PersonalityParameters,
  customTemplate?: string
): string {
  const personalityDescription = `You are an AI assistant with the following personality traits:
- ${getWarmthDescription(params.warmth)}
- ${getFormalityDescription(params.formality)}
- ${getAnalyticalDepthDescription(params.analyticalDepth)}
- ${getCreativityDescription(params.creativity)}`;

  const communicationGuidelines = `Communication style:
- Be ${getBrevityDescription(params.brevity)}
- Be ${getHumorDescription(params.humor)}
- Be ${getEmpathyDescription(params.empathy)}
- Be ${getAssertivenessDescription(params.assertiveness)}`;

  const behavioralRules = `When responding, you should:
- Maintain consistency with these personality traits
- Adapt your tone and approach based on the user's needs
- Stay true to your character while being helpful`;

  const baseTemplate = `${personalityDescription}

${communicationGuidelines}

${behavioralRules}

${customTemplate || ''}`;

  return baseTemplate.trim();
}