interface ExplanationResult {
  summary: string[];
  walkthrough: string;
  glossary: Array<{ term: string; definition: string }>;
  complexity: string;
  pitfalls: string[];
  refactors: string[];
}

const STYLE_PROMPTS = {
  '12': 'Explain like a patient teacher for a 12-year-old. Use simple words, everyday analogies, and very short sentences. Avoid technical jargon completely.',
  '15': 'Explain clearly for a high school student. Use clear language with some technical terms but always explain them. Use analogies when helpful.',
  'cs1': 'Explain for a first-year computer science student. Use appropriate CS terminology but ensure concepts are well explained.',
  'pro': 'Explain for a professional developer. Use advanced concepts, technical terminology, and focus on best practices and optimization.'
};

export async function generateExplanation(
  code: string, 
  language: string, 
  level: string
): Promise<ExplanationResult> {
  const stylePrompt = STYLE_PROMPTS[level as keyof typeof STYLE_PROMPTS] || STYLE_PROMPTS['15'];
  
  const prompt = `${stylePrompt}

Analyze this ${language} code and provide a structured explanation:

\`\`\`${language}
${code}
\`\`\`

Provide your response in this exact JSON format:
{
  "summary": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],
  "walkthrough": "Step-by-step explanation of how the code works...",
  "glossary": [{"term": "concept", "definition": "explanation"}],
  "complexity": "Time and space complexity analysis",
  "pitfalls": ["common mistake 1", "common mistake 2"],
  "refactors": ["improvement suggestion 1", "improvement suggestion 2"]
}

Focus on: What it does → How it works step-by-step → Why it's written this way → Edge cases → One refactor idea.`;

  try {
    // Try different LLM providers based on available API keys
    if (process.env.OPENAI_API_KEY) {
      return await callOpenAI(prompt);
    } else if (process.env.ANTHROPIC_API_KEY) {
      return await callAnthropic(prompt);
    } else {
      // Fallback to mock response for development
      return getMockExplanation(code, language, level);
    }
  } catch (error) {
    console.error('LLM call failed:', error);
    return getMockExplanation(code, language, level);
  }
}

async function callOpenAI(prompt: string): Promise<ExplanationResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse LLM response as JSON');
  }
}

async function callAnthropic(prompt: string): Promise<ExplanationResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse LLM response as JSON');
  }
}

function getMockExplanation(code: string, language: string, level: string): ExplanationResult {
  // Provide different mock responses based on language and content
  if (code.includes('fizzbuzz') || code.includes('FizzBuzz')) {
    return {
      summary: [
        "This is a FizzBuzz implementation that prints numbers 1 to n",
        "Numbers divisible by 3 print 'Fizz'",
        "Numbers divisible by 5 print 'Buzz'", 
        "Numbers divisible by both 3 and 5 print 'FizzBuzz'"
      ],
      walkthrough: level === '12' 
        ? "This code is like a counting game! First, we start counting from 1. For each number, we check if it can be divided by 3 with no remainder - if yes, we say 'Fizz'. If it can be divided by 5 with no remainder, we say 'Buzz'. If it can be divided by both 3 and 5, we say 'FizzBuzz'. Otherwise, we just say the number."
        : "The function iterates through numbers 1 to n. For each number, it uses the modulo operator (%) to check divisibility. The order of conditions is important: we check for divisibility by 15 first (both 3 and 5), then 3, then 5, and finally print the number itself if none of the conditions match.",
      glossary: [
        { term: "Modulo operator (%)", definition: "Returns the remainder after division" },
        { term: "Loop", definition: "Repeats code multiple times" },
        { term: "Conditional", definition: "Makes decisions based on true/false conditions" }
      ],
      complexity: "Time: O(n) - we check each number once. Space: O(1) - we only use a few variables.",
      pitfalls: [
        "Forgetting to check divisibility by 15 first",
        "Using wrong order of if-elif conditions"
      ],
      refactors: [
        "Use string concatenation instead of multiple conditions",
        "Extract the logic into a separate function for reusability"
      ]
    };
  }

  if (code.includes('binarySearch') || code.includes('binary')) {
    return {
      summary: [
        "This implements binary search to find a target value in a sorted array",
        "It repeatedly divides the search space in half",
        "Returns the index of the target value if found",
        "Returns -1 if the target value is not in the array"
      ],
      walkthrough: level === '12'
        ? "Imagine you're looking for a word in a dictionary. Instead of starting from the beginning, you open to the middle. If your word comes before the middle word, you look in the first half. If it comes after, you look in the second half. You keep cutting the section in half until you find your word!"
        : "The algorithm maintains two pointers (left and right) that define the current search space. In each iteration, it calculates the middle index and compares the middle element with the target. Based on the comparison, it eliminates half of the remaining elements and continues the search in the appropriate half.",
      glossary: [
        { term: "Binary Search", definition: "An efficient algorithm to find items in sorted lists" },
        { term: "Divide and Conquer", definition: "Breaking a problem into smaller, similar problems" },
        { term: "Time Complexity", definition: "How the algorithm's speed changes with input size" }
      ],
      complexity: "Time: O(log n) - we halve the search space each time. Space: O(1) - we only use a few variables.",
      pitfalls: [
        "Array must be sorted for binary search to work",
        "Integer overflow when calculating mid = (left + right) / 2"
      ],
      refactors: [
        "Use Math.floor((left + right) / 2) to avoid potential overflow",
        "Add input validation to ensure array is sorted"
      ]
    };
  }

  // Generic mock response
  return {
    summary: [
      `This ${language} code performs a specific computational task`,
      "It uses common programming constructs like variables and control flow",
      "The logic is structured to handle the main use case",
      "The output depends on the input parameters provided"
    ],
    walkthrough: "The code starts by defining the main logic, then processes the input step by step using appropriate data structures and algorithms to achieve the desired outcome.",
    glossary: [
      { term: "Variable", definition: "A storage location with a name that holds data" },
      { term: "Function", definition: "A reusable block of code that performs a specific task" },
      { term: "Algorithm", definition: "A step-by-step procedure to solve a problem" }
    ],
    complexity: "The time and space complexity depend on the specific operations performed in the code.",
    pitfalls: [
      "Always validate input parameters",
      "Consider edge cases and error handling"
    ],
    refactors: [
      "Add comprehensive error handling",
      "Consider extracting reusable components"
    ]
  };
}