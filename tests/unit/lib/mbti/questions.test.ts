import { describe, test, expect } from 'vitest';
import { getQuestions } from '@/lib/mbti/questions';

describe('getQuestions', () => {
  test('should return 24 questions for Japanese locale', () => {
    // Act
    const questions = getQuestions('ja');

    // Assert
    expect(questions).toHaveLength(24);
    expect(questions.every(q => q.prompt && typeof q.prompt === 'string')).toBe(true);
    expect(questions.every(q => q.id && typeof q.id === 'string')).toBe(true);
    expect(questions.every(q => ['EI', 'SN', 'TF', 'JP'].includes(q.axis))).toBe(true);
    expect(questions.every(q => [-1, 1].includes(q.direction))).toBe(true);
    expect(questions.every(q => typeof q.order === 'number')).toBe(true);
  });

  test('should return 24 questions for English locale', () => {
    // Act
    const questions = getQuestions('en');

    // Assert
    expect(questions).toHaveLength(24);
    expect(questions.every(q => q.prompt && typeof q.prompt === 'string')).toBe(true);
    expect(questions.every(q => q.id && typeof q.id === 'string')).toBe(true);
    expect(questions.every(q => ['EI', 'SN', 'TF', 'JP'].includes(q.axis))).toBe(true);
    expect(questions.every(q => [-1, 1].includes(q.direction))).toBe(true);
    expect(questions.every(q => typeof q.order === 'number')).toBe(true);
  });

  test('should have exactly 6 questions per axis', () => {
    // Act
    const questions = getQuestions('ja');

    // Assert
    const axisCount = questions.reduce((acc, q) => {
      acc[q.axis] = (acc[q.axis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(axisCount.EI).toBe(6);
    expect(axisCount.SN).toBe(6);
    expect(axisCount.TF).toBe(6);
    expect(axisCount.JP).toBe(6);
  });

  test('should have different prompts between locales', () => {
    // Act
    const jaQuestions = getQuestions('ja');
    const enQuestions = getQuestions('en');

    // Assert
    expect(jaQuestions[0].prompt).not.toBe(enQuestions[0].prompt);
    expect(jaQuestions[0].id).toBe(enQuestions[0].id); // Same IDs
    expect(jaQuestions[0].axis).toBe(enQuestions[0].axis); // Same axis
  });

  test('should have balanced direction distribution', () => {
    // Act
    const questions = getQuestions('ja');

    // Assert
    const directionCount = questions.reduce((acc, q) => {
      acc[q.direction] = (acc[q.direction] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Should have some mix of positive and negative directions
    expect(directionCount[1]).toBeGreaterThan(0);
    expect(directionCount[-1]).toBeGreaterThan(0);
  });

  test('should be ordered by order field', () => {
    // Act
    const questions = getQuestions('ja');

    // Assert
    const orders = questions.map(q => q.order);
    const sortedOrders = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sortedOrders);
  });

  test('should have unique question IDs', () => {
    // Act
    const questions = getQuestions('ja');

    // Assert
    const ids = questions.map(q => q.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toHaveLength(uniqueIds.length);
  });

  test('should handle invalid locale gracefully', () => {
    // Act & Assert
    expect(() => getQuestions('invalid' as any)).toThrow('Unsupported locale');
  });
});