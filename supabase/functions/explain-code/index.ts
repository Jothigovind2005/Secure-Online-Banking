import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Language detection utilities
function detectLanguage(code: string): string {
  const patterns = {
    python: [/def\s+\w+\s*\(/, /import\s+\w+/, /print\s*\(/, /:\s*$/m],
    javascript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /console\.log/, /=>\s*{/],
    typescript: [/:\s*(string|number|boolean)/, /interface\s+\w+/, /type\s+\w+\s*=/],
    java: [/public\s+class\s+\w+/, /System\.out\.print/, /public\s+static\s+void\s+main/],
    cpp: [/#include\s*<\w+>/, /using\s+namespace\s+std/, /cout\s*<</],
    go: [/package\s+main/, /func\s+main\s*\(/, /fmt\.Print/],
    sql: [/SELECT\s+.+\s+FROM/i, /INSERT\s+INTO/i, /CREATE\s+TABLE/i],
    html: [/<html/i, /<body>/i, /<div/i, /<!DOCTYPE/i],
    css: [/\w+\s*{\s*[\w-]+:\s*[^}]+}/, /@media/, /\.\w+\s*{/]
  }

  let maxScore = 0
  let detectedLang = 'javascript'

  for (const [lang, regexes] of Object.entries(patterns)) {
    const score = regexes.reduce((acc, regex) => acc + (regex.test(code) ? 1 : 0), 0)
    if (score > maxScore) {
      maxScore = score
      detectedLang = lang
    }
  }

  return detectedLang
}

// Generate Mermaid diagram
function buildMermaidDiagram(code: string, language: string): string {
  const hasLoops = /\b(for|while|do)\b/i.test(code)
  const hasConditionals = /\b(if|else|switch|case)\b/i.test(code)

  // For authentication flow demo
  if (code.toLowerCase().includes('auth') || code.toLowerCase().includes('login')) {
    return `graph TD
    A[Start] --> B{User Logged In?}
    B -->|Yes| C[Dashboard]
    B -->|No| D[Show Login Options]
    D --> E{Login Method}
    E -->|Email/Password| F[Email Login]
    E -->|Guest Session| G[Create Guest Session]
    F -->|Success| C
    F -->|Failed| D
    G --> H[Temporary Session Created]
    H --> I[Dashboard with Guest Badge]
    C --> J[User Actions]
    I --> J
    J --> K{Logout?}
    K -->|Yes| A
    K -->|No| J`
  }

  if (hasLoops && hasConditionals) {
    return `graph TD
    A[Start] --> B[Initialize Variables]
    B --> C[Loop Condition]
    C -->|True| D{Check Condition}
    D -->|Met| E[Execute Action A]
    D -->|Not Met| F[Check Next Condition]
    F -->|Met| G[Execute Action B]
    F -->|Not Met| H[Default Action]
    E --> I[Update Loop Variable]
    G --> I
    H --> I
    I --> C
    C -->|False| J[End]`
  } else if (hasLoops) {
    return `graph TD
    A[Start] --> B[Initialize Counter]
    B --> C[Check Loop Condition]
    C -->|True| D[Execute Loop Body]
    D --> E[Update Counter]
    E --> C
    C -->|False| F[End]`
  } else if (hasConditionals) {
    return `graph TD
    A[Start] --> B[Check Condition]
    B -->|True| C[Execute Branch A]
    B -->|False| D[Execute Branch B]
    C --> E[End]
    D --> E`
  } else {
    return `graph TD
    A[Start] --> B[Process Input]
    B --> C[Apply Logic]
    C --> D[Generate Output]
    D --> E[End]`
  }
}

// Generate explanation using mock data (replace with actual LLM later)
function generateExplanation(code: string, language: string, level: string) {
  // Mock explanation based on common patterns
  if (code.toLowerCase().includes('fizzbuzz')) {
    return {
      summary: [
        "This is a FizzBuzz implementation that prints numbers 1 to n",
        "Numbers divisible by 3 print 'Fizz'",
        "Numbers divisible by 5 print 'Buzz'",
        "Numbers divisible by both 3 and 5 print 'FizzBuzz'"
      ],
      walkthrough: level === '12' 
        ? "This code is like a counting game! We count from 1 to a number. For each number, we check if it can be divided by 3 with no leftover - if yes, we say 'Fizz'. If it can be divided by 5 with no leftover, we say 'Buzz'. If both, we say 'FizzBuzz'!"
        : "The function iterates through numbers 1 to n using a loop. For each number, it uses the modulo operator (%) to check divisibility. It checks divisibility by 15 first (both 3 and 5), then 3, then 5, and finally prints the number if none match.",
      glossary: [
        { term: "Modulo operator (%)", definition: "Returns the remainder after division" },
        { term: "Loop", definition: "Repeats code multiple times" },
        { term: "Conditional", definition: "Makes decisions based on true/false conditions" }
      ],
      complexity: "Time: O(n) - we check each number once. Space: O(1) - we only use a few variables.",
      pitfalls: ["Forgetting to check divisibility by 15 first", "Using wrong order of conditions"],
      refactors: ["Use string concatenation instead of multiple conditions", "Extract logic into separate function"]
    }
  }

  if (code.toLowerCase().includes('binary')) {
    return {
      summary: [
        "This implements binary search to find a target value in a sorted array",
        "It repeatedly divides the search space in half",
        "Returns the index of the target value if found",
        "Returns -1 if the target value is not in the array"
      ],
      walkthrough: level === '12'
        ? "Imagine looking for a word in a dictionary. Instead of starting from the beginning, you open to the middle. If your word comes before the middle word, you look in the first half. You keep cutting the section in half until you find your word!"
        : "The algorithm maintains two pointers (left and right) defining the search space. Each iteration calculates the middle index and compares with the target. Based on comparison, it eliminates half the remaining elements.",
      glossary: [
        { term: "Binary Search", definition: "Efficient algorithm to find items in sorted lists" },
        { term: "Time Complexity", definition: "How algorithm speed changes with input size" }
      ],
      complexity: "Time: O(log n) - we halve the search space each time. Space: O(1) - only uses a few variables.",
      pitfalls: ["Array must be sorted", "Potential integer overflow in mid calculation"],
      refactors: ["Use Math.floor((left + right) / 2) to avoid overflow", "Add input validation"]
    }
  }

  // Default explanation
  return {
    summary: [
      `This ${language} code performs a specific computational task`,
      "It uses common programming constructs like variables and control flow",
      "The logic is structured to handle the main use case",
      "The output depends on the input parameters provided"
    ],
    walkthrough: "The code processes input step by step using appropriate data structures and algorithms to achieve the desired outcome.",
    glossary: [
      { term: "Variable", definition: "A storage location with a name that holds data" },
      { term: "Function", definition: "A reusable block of code that performs a specific task" }
    ],
    complexity: "The time and space complexity depend on the specific operations performed.",
    pitfalls: ["Always validate input parameters", "Consider edge cases and error handling"],
    refactors: ["Add comprehensive error handling", "Extract reusable components"]
  }
}

// Generate quiz questions
function generateQuiz(explanation: any, language: string) {
  return {
    questions: [
      {
        question: "What is the main purpose of this code?",
        options: [
          explanation.summary[0] || "Processes data according to specific logic",
          "Creates a graphical user interface",
          "Manages database connections",
          "Handles file system operations"
        ],
        correct: 0,
        hint: "Look at the overall structure and main operations.",
        rationale: explanation.summary[0] || "The code's primary function is data processing."
      },
      {
        question: "Which programming concept is most important here?",
        options: [
          explanation.glossary[0]?.term || "Variables and data types",
          "Network protocols",
          "Database schemas",
          "UI frameworks"
        ],
        correct: 0,
        hint: "Think about the fundamental building blocks used.",
        rationale: `${explanation.glossary[0]?.term}: ${explanation.glossary[0]?.definition}` || "Variables are essential for most code."
      },
      {
        question: "What should you check before running this code?",
        options: [
          "Input requirements and dependencies",
          "Internet connection speed",
          "Screen resolution",
          "Audio settings"
        ],
        correct: 0,
        hint: "Think about what the code needs to work properly.",
        rationale: "Understanding input requirements prevents runtime errors."
      },
      {
        question: "How would you improve this code's readability?",
        options: [
          "Add meaningful comments and better variable names",
          "Remove all whitespace",
          "Use shorter variable names",
          "Put everything on one line"
        ],
        correct: 0,
        hint: "Think about what makes code easier to understand.",
        rationale: "Comments and descriptive names make code much easier to read."
      },
      {
        question: "What's a good practice when writing similar code?",
        options: [
          explanation.refactors[0] || "Test with different inputs and handle edge cases",
          "Never add comments",
          "Use random variable names",
          "Ignore error handling"
        ],
        correct: 0,
        hint: "Think about code reliability and maintainability.",
        rationale: explanation.refactors[0] || "Testing and error handling are crucial for robust code."
      }
    ]
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code, language, level = '15' } = await req.json()

    if (!code || !code.trim()) {
      return new Response(
        JSON.stringify({ error: 'No code provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing code explanation request:', { language, level })

    // Detect language if auto-detect is selected
    const detectedLanguage = language === 'auto' ? detectLanguage(code) : language

    // Generate explanation
    const explanation = generateExplanation(code, detectedLanguage, level)

    // Generate Mermaid diagram
    const diagram = buildMermaidDiagram(code, detectedLanguage)

    // Generate quiz
    const quiz = generateQuiz(explanation, detectedLanguage)

    const response = {
      language: detectedLanguage,
      summary: explanation.summary,
      walkthrough: explanation.walkthrough,
      glossary: explanation.glossary,
      complexity: explanation.complexity,
      pitfalls: explanation.pitfalls,
      refactors: explanation.refactors,
      diagram,
      quiz
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Explanation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to explain code' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})