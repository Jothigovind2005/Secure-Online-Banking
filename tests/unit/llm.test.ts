import { describe, it, expect } from 'vitest'
import { LLMProvider, createLLMProvider } from '../../src/lib/backend/llm'

describe('LLMProvider', () => {
  describe('Mock Provider', () => {
    it('should return mock response with all required fields', async () => {
      const provider = createLLMProvider('mock')
      const result = await provider.explain('def hello(): print("hello")', 'python', 'cs1')

      expect(result).toHaveProperty('explanation')
      expect(result).toHaveProperty('mermaid')
      expect(result).toHaveProperty('trace')
      expect(result).toHaveProperty('quizzes')
      
      expect(typeof result.explanation).toBe('string')
      expect(typeof result.mermaid).toBe('string')
      expect(Array.isArray(result.quizzes)).toBe(true)
      expect(result.quizzes).toHaveLength(3)
      
      // Check quiz structure
      result.quizzes.forEach(quiz => {
        expect(quiz).toHaveProperty('question')
        expect(quiz).toHaveProperty('choices')
        expect(quiz).toHaveProperty('answer')
        expect(quiz).toHaveProperty('hint')
        expect(quiz).toHaveProperty('difficulty')
        expect(Array.isArray(quiz.choices)).toBe(true)
      })

      // Check trace structure
      expect(result.trace).toHaveProperty('input')
      expect(result.trace).toHaveProperty('steps')
      expect(Array.isArray(result.trace.steps)).toBe(true)
    })

    it('should work with different reading levels', async () => {
      const provider = createLLMProvider('mock')
      
      const levels: Array<'12' | '15' | 'cs1' | 'pro'> = ['12', '15', 'cs1', 'pro']
      
      for (const level of levels) {
        const result = await provider.explain('x = 1 + 1', 'python', level)
        expect(result).toHaveProperty('explanation')
        expect(typeof result.explanation).toBe('string')
      }
    })
  })

  describe('OpenAI Provider', () => {
    it('should throw error without API key', async () => {
      const provider = createLLMProvider('openai')
      
      await expect(
        provider.explain('def test(): pass', 'python', 'cs1')
      ).rejects.toThrow('OpenAI API key not provided')
    })
  })

  describe('Anthropic Provider', () => {
    it('should throw error without API key', async () => {
      const provider = createLLMProvider('anthropic')
      
      await expect(
        provider.explain('def test(): pass', 'python', 'cs1')
      ).rejects.toThrow('Anthropic API key not provided')
    })
  })
})