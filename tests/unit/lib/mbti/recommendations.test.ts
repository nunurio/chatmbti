import { describe, test, expect } from 'vitest';
import { calculateCompatibility, getTopRecommendations } from '@/lib/mbti/recommendations';

describe('calculateCompatibility', () => {
  test('should return 100 for identical types', () => {
    // Act
    const result = calculateCompatibility('INTJ', 'INTJ');

    // Assert
    expect(result).toBe(100);
  });

  test('should return lower score for opposite types', () => {
    // Act
    const result = calculateCompatibility('INTJ', 'ESFP');

    // Assert
    expect(result).toBeLessThan(50);
    expect(result).toBeGreaterThan(0);
  });

  test('should return high score for complementary types', () => {
    // INTJ and ENFP are considered complementary
    const result = calculateCompatibility('INTJ', 'ENFP');

    // Assert
    expect(result).toBeGreaterThan(70);
    expect(result).toBeLessThan(100);
  });

  test('should be symmetric', () => {
    // Act
    const result1 = calculateCompatibility('INTJ', 'ENFP');
    const result2 = calculateCompatibility('ENFP', 'INTJ');

    // Assert
    expect(result1).toBe(result2);
  });

  test('should handle all valid MBTI type combinations', () => {
    // Arrange
    const types = ['INTJ', 'ENFP', 'ISTJ', 'ESFP'];

    // Act & Assert
    for (const type1 of types) {
      for (const type2 of types) {
        const result = calculateCompatibility(type1, type2);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(100);
      }
    }
  });

  test('should throw error for invalid MBTI types', () => {
    // Act & Assert
    expect(() => calculateCompatibility('INVALID', 'INTJ')).toThrow('Invalid MBTI type');
    expect(() => calculateCompatibility('INTJ', 'INVALID')).toThrow('Invalid MBTI type');
  });
});

describe('getTopRecommendations', () => {
  test('should return top 3 recommendations', () => {
    // Arrange
    const userType = 'INTJ';
    const personas = [
      { id: '1', name: 'Alice', mbtiType: 'ENFP', description: 'Friendly helper' },
      { id: '2', name: 'Bob', mbtiType: 'INTJ', description: 'Logical analyst' },
      { id: '3', name: 'Carol', mbtiType: 'ESFP', description: 'Energetic entertainer' },
      { id: '4', name: 'Dave', mbtiType: 'ISTJ', description: 'Reliable organizer' },
      { id: '5', name: 'Eve', mbtiType: 'ENTP', description: 'Creative innovator' },
    ];

    // Act
    const recommendations = getTopRecommendations(userType, personas);

    // Assert
    expect(recommendations).toHaveLength(3);
    expect(recommendations.every(r => r.compatibility >= 0 && r.compatibility <= 100)).toBe(true);
    expect(recommendations.every(r => r.persona)).toBe(true);
    
    // Should be sorted by compatibility (highest first)
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].compatibility).toBeGreaterThanOrEqual(recommendations[i].compatibility);
    }
  });

  test('should handle fewer than 3 personas', () => {
    // Arrange
    const userType = 'INTJ';
    const personas = [
      { id: '1', name: 'Alice', mbtiType: 'ENFP', description: 'Friendly helper' },
      { id: '2', name: 'Bob', mbtiType: 'INTJ', description: 'Logical analyst' },
    ];

    // Act
    const recommendations = getTopRecommendations(userType, personas);

    // Assert
    expect(recommendations).toHaveLength(2);
  });

  test('should handle empty personas array', () => {
    // Arrange
    const userType = 'INTJ';
    const personas: any[] = [];

    // Act
    const recommendations = getTopRecommendations(userType, personas);

    // Assert
    expect(recommendations).toHaveLength(0);
  });

  test('should prioritize exact type matches', () => {
    // Arrange
    const userType = 'INTJ';
    const personas = [
      { id: '1', name: 'Alice', mbtiType: 'ESFP', description: 'Opposite type' },
      { id: '2', name: 'Bob', mbtiType: 'INTJ', description: 'Same type' },
      { id: '3', name: 'Carol', mbtiType: 'ENFP', description: 'Complementary type' },
    ];

    // Act
    const recommendations = getTopRecommendations(userType, personas);

    // Assert
    expect(recommendations[0].persona.name).toBe('Bob'); // Exact match should be first
    expect(recommendations[0].compatibility).toBe(100);
  });

  test('should exclude personas without MBTI type', () => {
    // Arrange
    const userType = 'INTJ';
    const personas = [
      { id: '1', name: 'Alice', mbtiType: 'ENFP', description: 'Has type' },
      { id: '2', name: 'Bob', description: 'No type' }, // Missing mbtiType
      { id: '3', name: 'Carol', mbtiType: '', description: 'Empty type' },
      { id: '4', name: 'Dave', mbtiType: 'ISTJ', description: 'Has type' },
    ];

    // Act
    const recommendations = getTopRecommendations(userType, personas);

    // Assert
    expect(recommendations).toHaveLength(2);
    expect(recommendations.every(r => r.persona.mbtiType && r.persona.mbtiType.length === 4)).toBe(true);
  });
});