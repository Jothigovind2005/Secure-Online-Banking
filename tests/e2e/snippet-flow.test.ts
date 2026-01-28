import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// E2E test for the complete snippet flow
// Note: This requires a test Supabase project or environment variables for testing

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
const testEmail = 'test@example.com'
const testPassword = 'testpassword123'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

describe('Snippet Flow E2E', () => {
  let testUserId: string
  let testToken: string

  beforeAll(async () => {
    // Create test user
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (error) {
      console.warn('Test user might already exist:', error.message)
      // Try to sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        throw new Error(`Failed to create or sign in test user: ${signInError.message}`)
      }
      
      testUserId = signInData.user!.id
      testToken = signInData.session!.access_token
    } else {
      testUserId = data.user.id
      
      // Sign in to get token
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        throw new Error(`Failed to sign in test user: ${signInError.message}`)
      }
      
      testToken = signInData.session!.access_token
    }
  })

  afterAll(async () => {
    // Clean up test user
    try {
      await supabase.auth.admin.deleteUser(testUserId)
    } catch (error) {
      console.warn('Failed to delete test user:', error)
    }
  })

  it('should create snippet and explanation via API', async () => {
    const testCode = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`

    const response = await fetch(`${supabaseUrl}/functions/v1/explain`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Factorial Function',
        language: 'python',
        code: testCode,
        reading_level: 'cs1'
      })
    })

    expect(response.ok).toBe(true)
    
    const result = await response.json()
    
    expect(result).toHaveProperty('snippet')
    expect(result).toHaveProperty('quizzes')
    
    expect(result.snippet.title).toBe('Factorial Function')
    expect(result.snippet.language).toBe('python')
    expect(result.snippet.code).toBe(testCode)
    expect(result.snippet.status).toBe('ready')
    expect(result.snippet.owner).toBe(testUserId)
    
    expect(Array.isArray(result.quizzes)).toBe(true)
    expect(result.quizzes.length).toBeGreaterThan(0)
    
    // Test getting the snippet
    const getResponse = await fetch(`${supabaseUrl}/functions/v1/snippet?id=${result.snippet.id}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    })
    
    expect(getResponse.ok).toBe(true)
    
    const getResult = await getResponse.json()
    expect(getResult.snippet.id).toBe(result.snippet.id)
    expect(Array.isArray(getResult.quizzes)).toBe(true)
  })

  it('should regenerate explanation', async () => {
    // First create a snippet
    const testCode = 'print("Hello, World!")'

    const createResponse = await fetch(`${supabaseUrl}/functions/v1/explain`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Hello World',
        language: 'python',
        code: testCode,
        reading_level: 'cs1'
      })
    })

    const createResult = await createResponse.json()
    const snippetId = createResult.snippet.id

    // Then regenerate with different reading level
    const regenResponse = await fetch(`${supabaseUrl}/functions/v1/regenerate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet_id: snippetId,
        reading_level: '12'
      })
    })

    expect(regenResponse.ok).toBe(true)
    
    const regenResult = await regenResponse.json()
    expect(regenResult.snippet.id).toBe(snippetId)
    expect(regenResult.snippet.status).toBe('ready')
  })

  it('should handle unauthorized access', async () => {
    const response = await fetch(`${supabaseUrl}/functions/v1/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: 'python',
        code: 'print("test")'
      })
    })

    expect(response.status).toBe(401)
  })
})