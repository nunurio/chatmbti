import { describe, test, expect } from 'vitest';
import { 
  validateParameters, 
  getDefaultParameters, 
  getMBTIDefaults,
  type PersonalityParameters 
} from '@/lib/personas/parameters';

describe('PersonalityParameters', () => {
  test('validateParameters should return true for valid parameters', () => {
    // Arrange
    const validParams: PersonalityParameters = {
      warmth: 50,
      formality: 50,
      brevity: 50,
      humor: 50,
      analyticalDepth: 50,
      creativity: 50,
      empathy: 50,
      assertiveness: 50,
    };

    // Act
    const result = validateParameters(validParams);

    // Assert
    expect(result).toBe(true);
  });

  test('validateParameters should return false for parameters below 0', () => {
    // Arrange
    const invalidParams: PersonalityParameters = {
      warmth: -1,
      formality: 50,
      brevity: 50,
      humor: 50,
      analyticalDepth: 50,
      creativity: 50,
      empathy: 50,
      assertiveness: 50,
    };

    // Act
    const result = validateParameters(invalidParams);

    // Assert
    expect(result).toBe(false);
  });

  test('validateParameters should return false for parameters above 100', () => {
    // Arrange
    const invalidParams: PersonalityParameters = {
      warmth: 50,
      formality: 101,
      brevity: 50,
      humor: 50,
      analyticalDepth: 50,
      creativity: 50,
      empathy: 50,
      assertiveness: 50,
    };

    // Act
    const result = validateParameters(invalidParams);

    // Assert
    expect(result).toBe(false);
  });

  test('validateParameters should return true for boundary values (0 and 100)', () => {
    // Arrange
    const boundaryParams: PersonalityParameters = {
      warmth: 0,
      formality: 100,
      brevity: 0,
      humor: 100,
      analyticalDepth: 0,
      creativity: 100,
      empathy: 0,
      assertiveness: 100,
    };

    // Act
    const result = validateParameters(boundaryParams);

    // Assert
    expect(result).toBe(true);
  });
});

describe('getDefaultParameters', () => {
  test('should return balanced default values (all 50)', () => {
    // Act
    const defaults = getDefaultParameters();

    // Assert
    expect(defaults.warmth).toBe(50);
    expect(defaults.formality).toBe(50);
    expect(defaults.brevity).toBe(50);
    expect(defaults.humor).toBe(50);
    expect(defaults.analyticalDepth).toBe(50);
    expect(defaults.creativity).toBe(50);
    expect(defaults.empathy).toBe(50);
    expect(defaults.assertiveness).toBe(50);
  });

  test('should return valid parameters according to validation', () => {
    // Act
    const defaults = getDefaultParameters();

    // Assert
    expect(validateParameters(defaults)).toBe(true);
  });
});

describe('getMBTIDefaults', () => {
  test('should return characteristic parameters for INTJ type', () => {
    // Act
    const intjParams = getMBTIDefaults('INTJ');

    // Assert
    expect(intjParams.analyticalDepth).toBe(85); // High analytical depth
    expect(intjParams.warmth).toBe(30); // Low warmth  
    expect(intjParams.formality).toBe(60); // Moderate formality
    expect(validateParameters(intjParams)).toBe(true);
  });

  test('should return characteristic parameters for ENFP type', () => {
    // Act
    const enfpParams = getMBTIDefaults('ENFP');

    // Assert
    expect(enfpParams.warmth).toBe(85); // High warmth (extraversion)
    expect(enfpParams.creativity).toBe(90); // Very high creativity
    expect(enfpParams.formality).toBe(25); // Low formality
    expect(validateParameters(enfpParams)).toBe(true);
  });

  test('should return characteristic parameters for ISTJ type', () => {
    // Act
    const istjParams = getMBTIDefaults('ISTJ');

    // Assert
    expect(istjParams.formality).toBe(85); // High formality
    expect(istjParams.humor).toBe(20); // Low humor
    expect(istjParams.analyticalDepth).toBe(75); // High analytical depth
    expect(validateParameters(istjParams)).toBe(true);
  });

  test('should return valid parameters for any MBTI type', () => {
    // Act
    const params = getMBTIDefaults('INTJ');

    // Assert
    expect(validateParameters(params)).toBe(true);
  });

  test('should return default parameters for unknown MBTI type', () => {
    // Act
    const unknownParams = getMBTIDefaults('UNKNOWN');
    const defaultParams = getDefaultParameters();

    // Assert
    expect(unknownParams).toEqual(defaultParams);
  });
});