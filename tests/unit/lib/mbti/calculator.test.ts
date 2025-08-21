import { describe, test, expect } from 'vitest';
import { calculateMBTIType } from '@/lib/mbti/calculator';

describe('calculateMBTIType', () => {
  test('should return ESTJ for all extreme extroverted responses', () => {
    // Arrange - All responses strongly favor E, S, T, J
    const answers = [
      // EI axis - 6 questions favoring E (all 1s = strong E)
      { questionId: 'ei_1', value: 1 },
      { questionId: 'ei_2', value: 1 },
      { questionId: 'ei_3', value: 1 },
      { questionId: 'ei_4', value: 1 },
      { questionId: 'ei_5', value: 1 },
      { questionId: 'ei_6', value: 1 },
      // SN axis - 6 questions favoring S (all 1s = strong S)
      { questionId: 'sn_1', value: 1 },
      { questionId: 'sn_2', value: 1 },
      { questionId: 'sn_3', value: 1 },
      { questionId: 'sn_4', value: 1 },
      { questionId: 'sn_5', value: 1 },
      { questionId: 'sn_6', value: 1 },
      // TF axis - 6 questions favoring T (all 1s = strong T)
      { questionId: 'tf_1', value: 1 },
      { questionId: 'tf_2', value: 1 },
      { questionId: 'tf_3', value: 1 },
      { questionId: 'tf_4', value: 1 },
      { questionId: 'tf_5', value: 1 },
      { questionId: 'tf_6', value: 1 },
      // JP axis - 6 questions favoring J (all 1s = strong J)
      { questionId: 'jp_1', value: 1 },
      { questionId: 'jp_2', value: 1 },
      { questionId: 'jp_3', value: 1 },
      { questionId: 'jp_4', value: 1 },
      { questionId: 'jp_5', value: 1 },
      { questionId: 'jp_6', value: 1 },
    ];

    // Act
    const result = calculateMBTIType(answers);

    // Assert
    expect(result.type).toBe('ESTJ');
    expect(result.scores.EI).toBeLessThan(0); // E is negative
    expect(result.scores.SN).toBeLessThan(0); // S is negative
    expect(result.scores.TF).toBeLessThan(0); // T is negative
    expect(result.scores.JP).toBeLessThan(0); // J is negative
    expect(result.confidence).toBeGreaterThan(80); // High confidence for extreme scores
  });

  test('should return INFP for all extreme introverted responses', () => {
    // Arrange - All responses strongly favor I, N, F, P
    const answers = [
      // EI axis - 6 questions favoring I (all 7s = strong I)
      { questionId: 'ei_1', value: 7 },
      { questionId: 'ei_2', value: 7 },
      { questionId: 'ei_3', value: 7 },
      { questionId: 'ei_4', value: 7 },
      { questionId: 'ei_5', value: 7 },
      { questionId: 'ei_6', value: 7 },
      // SN axis - 6 questions favoring N (all 7s = strong N)
      { questionId: 'sn_1', value: 7 },
      { questionId: 'sn_2', value: 7 },
      { questionId: 'sn_3', value: 7 },
      { questionId: 'sn_4', value: 7 },
      { questionId: 'sn_5', value: 7 },
      { questionId: 'sn_6', value: 7 },
      // TF axis - 6 questions favoring F (all 7s = strong F)
      { questionId: 'tf_1', value: 7 },
      { questionId: 'tf_2', value: 7 },
      { questionId: 'tf_3', value: 7 },
      { questionId: 'tf_4', value: 7 },
      { questionId: 'tf_5', value: 7 },
      { questionId: 'tf_6', value: 7 },
      // JP axis - 6 questions favoring P (all 7s = strong P)
      { questionId: 'jp_1', value: 7 },
      { questionId: 'jp_2', value: 7 },
      { questionId: 'jp_3', value: 7 },
      { questionId: 'jp_4', value: 7 },
      { questionId: 'jp_5', value: 7 },
      { questionId: 'jp_6', value: 7 },
    ];

    // Act
    const result = calculateMBTIType(answers);

    // Assert
    expect(result.type).toBe('INFP');
    expect(result.scores.EI).toBeGreaterThan(0); // I is positive
    expect(result.scores.SN).toBeGreaterThan(0); // N is positive
    expect(result.scores.TF).toBeGreaterThan(0); // F is positive
    expect(result.scores.JP).toBeGreaterThan(0); // P is positive
    expect(result.confidence).toBeGreaterThan(80); // High confidence for extreme scores
  });

  test('should handle empty answers array', () => {
    // Arrange
    const answers: any[] = [];

    // Act & Assert
    expect(() => calculateMBTIType(answers)).toThrow('Insufficient answers for MBTI calculation');
  });

  test('should handle invalid value ranges', () => {
    // Arrange
    const answers = [
      { questionId: 'ei_1', value: 0 }, // Below range
      { questionId: 'ei_2', value: 8 }, // Above range
    ];

    // Act & Assert
    expect(() => calculateMBTIType(answers)).toThrow('Answer values must be between 1 and 7');
  });

  test('should calculate mixed responses correctly', () => {
    // Arrange - Mixed responses that should result in ENTJ
    const answers = [
      // EI axis - favoring E (all 2s = moderate E)
      { questionId: 'ei_1', value: 2 },
      { questionId: 'ei_2', value: 2 },
      { questionId: 'ei_3', value: 2 },
      { questionId: 'ei_4', value: 2 },
      { questionId: 'ei_5', value: 2 },
      { questionId: 'ei_6', value: 2 },
      // SN axis - favoring N (all 6s = moderate N)
      { questionId: 'sn_1', value: 6 },
      { questionId: 'sn_2', value: 6 },
      { questionId: 'sn_3', value: 6 },
      { questionId: 'sn_4', value: 6 },
      { questionId: 'sn_5', value: 6 },
      { questionId: 'sn_6', value: 6 },
      // TF axis - favoring T (all 2s = moderate T)
      { questionId: 'tf_1', value: 2 },
      { questionId: 'tf_2', value: 2 },
      { questionId: 'tf_3', value: 2 },
      { questionId: 'tf_4', value: 2 },
      { questionId: 'tf_5', value: 2 },
      { questionId: 'tf_6', value: 2 },
      // JP axis - favoring J (all 2s = moderate J)
      { questionId: 'jp_1', value: 2 },
      { questionId: 'jp_2', value: 2 },
      { questionId: 'jp_3', value: 2 },
      { questionId: 'jp_4', value: 2 },
      { questionId: 'jp_5', value: 2 },
      { questionId: 'jp_6', value: 2 },
    ];

    // Act
    const result = calculateMBTIType(answers);

    // Assert
    expect(result.type).toBe('ENTJ');
    expect(result.scores.EI).toBeLessThan(0); // E is negative
    expect(result.scores.SN).toBeGreaterThan(0); // N is positive
    expect(result.scores.TF).toBeLessThan(0); // T is negative
    expect(result.scores.JP).toBeLessThan(0); // J is negative
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(100);
  });

  test('should handle neutral responses', () => {
    // Arrange - All neutral responses (4 = middle of scale)
    const answers = [
      // All 24 questions with neutral response
      { questionId: 'ei_1', value: 4 },
      { questionId: 'ei_2', value: 4 },
      { questionId: 'ei_3', value: 4 },
      { questionId: 'ei_4', value: 4 },
      { questionId: 'ei_5', value: 4 },
      { questionId: 'ei_6', value: 4 },
      { questionId: 'sn_1', value: 4 },
      { questionId: 'sn_2', value: 4 },
      { questionId: 'sn_3', value: 4 },
      { questionId: 'sn_4', value: 4 },
      { questionId: 'sn_5', value: 4 },
      { questionId: 'sn_6', value: 4 },
      { questionId: 'tf_1', value: 4 },
      { questionId: 'tf_2', value: 4 },
      { questionId: 'tf_3', value: 4 },
      { questionId: 'tf_4', value: 4 },
      { questionId: 'tf_5', value: 4 },
      { questionId: 'tf_6', value: 4 },
      { questionId: 'jp_1', value: 4 },
      { questionId: 'jp_2', value: 4 },
      { questionId: 'jp_3', value: 4 },
      { questionId: 'jp_4', value: 4 },
      { questionId: 'jp_5', value: 4 },
      { questionId: 'jp_6', value: 4 },
    ];

    // Act
    const result = calculateMBTIType(answers);

    // Assert
    expect(result.scores.EI).toBe(0); // Perfect neutral
    expect(result.scores.SN).toBe(0); // Perfect neutral
    expect(result.scores.TF).toBe(0); // Perfect neutral
    expect(result.scores.JP).toBe(0); // Perfect neutral
    expect(result.confidence).toBeLessThan(30); // Low confidence for neutral
  });
});