import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RegenerateRequest {
  snippet_id: string
  reading_level: '12' | '15' | 'cs1' | 'pro'
}

interface LLMResponse {
  explanation: string
  mermaid: string
  trace: {
    input: string
    steps: Array<{ line: number; vars: Record<string, any> }>
  }
  quizzes: Array<{
    question: string
    choices: string[]
    answer: string
    hint: string
    difficulty: string
  }>
}

// LLM Provider function
async function callLLM(code: string, language: string, readingLevel: string): Promise<LLMResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiKey) {
    // Mock response for development
    return {
      explanation: `This ${language} code demonstrates key programming concepts. It uses variables to store data and control structures to manage program flow. The logic is structured to handle the main use case efficiently.`,
      mermaid: `graph TD\n    A[Start] --> B[Process Input]\n    B --> C[Apply Logic]\n    C --> D[Generate Output]\n    D --> E[End]`,
      trace: {
        input: "sample input",
        steps: [
          { line: 1, vars: { x: 1, y: 2 } },
          { line: 2, vars: { x: 1, y: 2, result: 3 } }
        ]
      },
      quizzes: [
        {
          question: "What is the main purpose of this code?",
          choices: ["Process data", "Create UI", "Manage files", "Handle network"],
          answer: "Process data",
          hint: "Look at the main operations",
          difficulty: "easy"
        },
        {
          question: "Which concept is most important here?",
          choices: ["Variables", "Networks", "Graphics", "Audio"],
          answer: "Variables",
          hint: "Think about data storage",
          difficulty: "medium"
        },
        {
          question: "What would this code output with input 'test'?",
          choices: ["test", "TEST", "error", "null"],
          answer: "test",
          hint: "Trace through the logic",
          difficulty: "hard"
        }
      ]
    }
  }

  const systemPrompt = `You are a patient coding teacher. Output JSON only. Given code, produce:
{
  "explanation": "<${readingLevel === '12' ? 'simple, analogical explanation for 12-year-olds' : readingLevel === '15' ? 'clear explanation for teenagers' : readingLevel === 'cs1' ? 'technical but beginner-friendly explanation' : 'professional, concise explanation'}>",
  "mermaid": "graph TD\\n    A[Start] --> B[...]",
  "trace": { "input": "sample", "steps": [{ "line": 1, "vars": {...} }] },
  "quizzes": [{ "question": "", "choices": [".."], "answer": "...", "hint": "...", "difficulty": "easy|medium|hard" }]
}
Limit explanation to 6 short paragraphs. Provide exactly 3 quizzes (2 MCQ, 1 predict output).`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Language: ${language}\nCode:\n${code}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    return JSON.parse(content)
  } catch (error) {
    console.error('LLM call failed:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.user.id

    // Parse request
    const { snippet_id, reading_level }: RegenerateRequest = await req.json()

    if (!snippet_id) {
      return new Response(
        JSON.stringify({ error: 'Missing snippet_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get existing snippet
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', snippet_id)
      .eq('owner', userId)
      .single()

    if (snippetError || !snippet) {
      return new Response(
        JSON.stringify({ error: 'Snippet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set status to pending
    await supabase
      .from('snippets')
      .update({ status: 'pending' })
      .eq('id', snippet_id)

    // Call LLM
    const llmResponse = await callLLM(snippet.code, snippet.language, reading_level || 'cs1')

    // Update snippet with new results
    const { data: updatedSnippet, error: updateError } = await supabase
      .from('snippets')
      .update({
        explanation: llmResponse.explanation,
        mermaid_diagram: llmResponse.mermaid,
        trace_table: llmResponse.trace,
        status: 'ready'
      })
      .eq('id', snippet_id)
      .select()
      .single()

    if (updateError) {
      console.error('Update snippet error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update snippet' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete existing quizzes
    await supabase
      .from('quizzes')
      .delete()
      .eq('snippet_id', snippet_id)

    // Insert new quizzes
    const quizInserts = llmResponse.quizzes.map(quiz => ({
      snippet_id: snippet_id,
      question: quiz.question,
      choices: quiz.choices,
      answer: quiz.answer,
      hint: quiz.hint,
      difficulty: quiz.difficulty
    }))

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizInserts)
      .select()

    if (quizError) {
      console.error('Insert quizzes error:', quizError)
      return new Response(
        JSON.stringify({ error: 'Failed to save quizzes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        snippet: updatedSnippet,
        quizzes: quizData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Regenerate function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})