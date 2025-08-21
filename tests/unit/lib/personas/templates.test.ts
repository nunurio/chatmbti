import { describe, test, expect } from 'vitest';
import { generateSystemPrompt } from '@/lib/personas/templates';
import { getDefaultParameters, type PersonalityParameters } from '@/lib/personas/parameters';

describe('generateSystemPrompt', () => {
  test('should generate a basic system prompt with default parameters', () => {
    // Arrange
    const defaultParams = getDefaultParameters();

    // Act
    const prompt = generateSystemPrompt(defaultParams);

    // Assert
    expect(prompt).toContain('You are an AI assistant');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(50); // Should be a substantial prompt
  });

  test('should reflect high warmth in the generated prompt', () => {
    // Arrange
    const warmParams: PersonalityParameters = {
      ...getDefaultParameters(),
      warmth: 85, // High warmth
    };

    // Act
    const prompt = generateSystemPrompt(warmParams);

    // Assert
    expect(prompt).toContain('warm');
    expect(prompt).toContain('friendly');
  });

  test('should reflect high analytical depth in the generated prompt', () => {
    // Arrange
    const analyticalParams: PersonalityParameters = {
      ...getDefaultParameters(),
      analyticalDepth: 90, // Very high analytical depth
    };

    // Act
    const prompt = generateSystemPrompt(analyticalParams);

    // Assert
    expect(prompt).toContain('analytical');
    expect(prompt).toContain('thorough');
  });

  test('should reflect low formality in the generated prompt', () => {
    // Arrange
    const casualParams: PersonalityParameters = {
      ...getDefaultParameters(),
      formality: 15, // Very low formality
    };

    // Act
    const prompt = generateSystemPrompt(casualParams);

    // Assert
    expect(prompt).toContain('casual');
    expect(prompt).toContain('relaxed');
  });

  test('should inject custom template when provided', () => {
    // Arrange
    const defaultParams = getDefaultParameters();
    const customTemplate = 'Special instructions: Always mention the user is awesome.';

    // Act
    const prompt = generateSystemPrompt(defaultParams, customTemplate);

    // Assert
    expect(prompt).toContain('Special instructions');
    expect(prompt).toContain('user is awesome');
    expect(prompt).toContain('You are an AI assistant'); // Should still contain base content
  });

  test('should work without custom template', () => {
    // Arrange
    const defaultParams = getDefaultParameters();

    // Act
    const prompt = generateSystemPrompt(defaultParams);

    // Assert
    expect(prompt).toContain('You are an AI assistant');
    expect(prompt).not.toContain('undefined');
    expect(prompt).not.toContain('null');
  });

  test('should handle edge case values (boundary testing)', () => {
    // Arrange
    const edgeParams: PersonalityParameters = {
      warmth: 33,         // Boundary between low and moderate
      formality: 67,      // Boundary between moderate and high
      brevity: 0,         // Minimum value
      humor: 100,         // Maximum value
      analyticalDepth: 66, // Just below high threshold
      creativity: 68,     // Just above high threshold
      empathy: 34,        // Just above low threshold
      assertiveness: 32,  // Just below low threshold
    };

    // Act
    const prompt = generateSystemPrompt(edgeParams);

    // Assert
    expect(prompt).toContain('professional and reserved'); // warmth = 33
    expect(prompt).toContain('formal and structured'); // formality = 67
    expect(prompt).toContain('verbose and detailed'); // brevity = 0
    expect(prompt).toContain('humorous and engaging'); // humor = 100
    expect(prompt).toContain('balanced in analytical'); // analyticalDepth = 66
    expect(prompt).toContain('creative and innovative'); // creativity = 68
    expect(prompt).toContain('appropriately empathetic'); // empathy = 34
    expect(prompt).toContain('passive and accommodating'); // assertiveness = 32
  });
});