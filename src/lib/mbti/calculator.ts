interface Answer {
  questionId: string;
  value: number; // 1-7 Likert scale
}

interface MBTIResult {
  type: string; // e.g., "INTJ"
  scores: {
    EI: number; // -100 to 100 (E negative, I positive)
    SN: number; // -100 to 100 (S negative, N positive)
    TF: number; // -100 to 100 (T negative, F positive)
    JP: number; // -100 to 100 (J negative, P positive)
  };
  confidence: number; // 0-100
}

export function calculateMBTIType(answers: Answer[]): MBTIResult {
  // Validation
  if (answers.length === 0) {
    throw new Error('Insufficient answers for MBTI calculation');
  }

  // Check valid ranges
  for (const answer of answers) {
    if (answer.value < 1 || answer.value > 7) {
      throw new Error('Answer values must be between 1 and 7');
    }
  }

  // Group answers by axis
  const axisSums: Record<'EI' | 'SN' | 'TF' | 'JP', number> = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  };

  const axisCounts: Record<'EI' | 'SN' | 'TF' | 'JP', number> = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  };

  // Calculate sum for each axis
  for (const answer of answers) {
    const axis = getAxisFromQuestionId(answer.questionId);
    if (axis) {
      // Convert 1-7 scale to -3 to +3 scale (center at 4)
      const normalizedValue = answer.value - 4;
      axisSums[axis] += normalizedValue;
      axisCounts[axis]++;
    }
  }

  // Calculate scores for each axis (-100 to +100)
  const scores = {
    EI: axisCounts.EI > 0 ? Math.round((axisSums.EI / axisCounts.EI) * 100 / 3) : 0,
    SN: axisCounts.SN > 0 ? Math.round((axisSums.SN / axisCounts.SN) * 100 / 3) : 0,
    TF: axisCounts.TF > 0 ? Math.round((axisSums.TF / axisCounts.TF) * 100 / 3) : 0,
    JP: axisCounts.JP > 0 ? Math.round((axisSums.JP / axisCounts.JP) * 100 / 3) : 0,
  };

  // Determine MBTI type
  const type = buildMBTIType(scores);

  // Calculate confidence based on how far from neutral (0) the scores are
  const confidence = calculateConfidence(scores);

  return {
    type,
    scores,
    confidence,
  };
}

function getAxisFromQuestionId(questionId: string): 'EI' | 'SN' | 'TF' | 'JP' | null {
  if (questionId.startsWith('ei_')) return 'EI';
  if (questionId.startsWith('sn_')) return 'SN';
  if (questionId.startsWith('tf_')) return 'TF';
  if (questionId.startsWith('jp_')) return 'JP';
  return null;
}

function buildMBTIType(scores: { EI: number; SN: number; TF: number; JP: number }): string {
  let type = '';
  
  // EI axis: negative = E, positive = I
  type += scores.EI <= 0 ? 'E' : 'I';
  
  // SN axis: negative = S, positive = N
  type += scores.SN <= 0 ? 'S' : 'N';
  
  // TF axis: negative = T, positive = F
  type += scores.TF <= 0 ? 'T' : 'F';
  
  // JP axis: negative = J, positive = P
  type += scores.JP <= 0 ? 'J' : 'P';
  
  return type;
}

function calculateConfidence(scores: { EI: number; SN: number; TF: number; JP: number }): number {
  // Calculate average absolute distance from neutral (0)
  const distances = [
    Math.abs(scores.EI),
    Math.abs(scores.SN),
    Math.abs(scores.TF),
    Math.abs(scores.JP),
  ];
  
  const averageDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  
  // Convert to confidence percentage (0-100)
  // Maximum possible distance is 100, so confidence = distance
  return Math.round(Math.min(averageDistance, 100));
}