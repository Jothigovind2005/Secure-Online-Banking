interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  hint: string;
  rationale: string;
  type: 'mcq' | 'predict' | 'debug';
}

interface Quiz {
  questions: QuizQuestion[];
}

export function generateQuiz(explanation: any, language: string): Quiz {
  const questions: QuizQuestion[] = [];

  // Generate different types of questions based on the explanation
  try {
    // MCQ about what the code does
    questions.push(generateWhatDoesItDoQuestion(explanation, language));
    
    // MCQ about key concepts
    questions.push(generateConceptQuestion(explanation, language));
    
    // Predict the output question
    questions.push(generatePredictOutputQuestion(explanation, language));
    
    // Debug/fix question
    questions.push(generateDebugQuestion(explanation, language));
    
    // Best practice question
    questions.push(generateBestPracticeQuestion(explanation, language));

  } catch (error) {
    console.error('Error generating quiz:', error);
    // Fallback to basic questions
    return getFallbackQuiz(language);
  }

  return { questions: questions.slice(0, 5) }; // Ensure exactly 5 questions
}

function generateWhatDoesItDoQuestion(explanation: any, language: string): QuizQuestion {
  const summary = explanation.summary || [];
  
  if (summary.length > 0) {
    const correctAnswer = summary[0];
    const wrongAnswers = [
      `Sorts an array of ${language} objects`,
      `Creates a new database connection`,
      `Validates user input forms`
    ];
    
    const options = shuffleArray([correctAnswer, ...wrongAnswers.slice(0, 3)]);
    const correctIndex = options.indexOf(correctAnswer);
    
    return {
      question: "What is the main purpose of this code?",
      options,
      correct: correctIndex,
      hint: "Look at the overall structure and the main operations being performed.",
      rationale: `The code's primary function is: ${correctAnswer}`,
      type: 'mcq'
    };
  }
  
  return getDefaultWhatDoesItDoQuestion(language);
}

function generateConceptQuestion(explanation: any, language: string): QuizQuestion {
  const glossary = explanation.glossary || [];
  
  if (glossary.length > 0) {
    const concept = glossary[0];
    const wrongDefinitions = [
      "A method for connecting to databases",
      "A way to style web pages",
      "A protocol for network communication"
    ];
    
    const options = shuffleArray([concept.definition, ...wrongDefinitions.slice(0, 3)]);
    const correctIndex = options.indexOf(concept.definition);
    
    return {
      question: `What is a ${concept.term}?`,
      options,
      correct: correctIndex,
      hint: `Think about how ${concept.term} is used in programming.`,
      rationale: `${concept.term}: ${concept.definition}`,
      type: 'mcq'
    };
  }
  
  return getDefaultConceptQuestion(language);
}

function generatePredictOutputQuestion(explanation: any, language: string): QuizQuestion {
  // Generate based on common patterns
  if (language === 'python' && explanation.summary.some((s: string) => s.includes('FizzBuzz'))) {
    return {
      question: "If you call fizz_buzz(15), what will be the output for the number 15?",
      options: ["15", "Fizz", "Buzz", "FizzBuzz"],
      correct: 3,
      hint: "15 is divisible by both 3 and 5.",
      rationale: "Since 15 is divisible by both 3 and 5, it prints 'FizzBuzz'.",
      type: 'predict'
    };
  }
  
  if (language === 'javascript' && explanation.summary.some((s: string) => s.includes('binary'))) {
    return {
      question: "What does binarySearch([1, 3, 5, 7, 9], 5) return?",
      options: ["0", "1", "2", "-1"],
      correct: 2,
      hint: "Think about the index of 5 in the array [1, 3, 5, 7, 9].",
      rationale: "The value 5 is at index 2 in the array, so the function returns 2.",
      type: 'predict'
    };
  }
  
  return getDefaultPredictQuestion(language);
}

function generateDebugQuestion(explanation: any, language: string): QuizQuestion {
  const pitfalls = explanation.pitfalls || [];
  
  if (pitfalls.length > 0) {
    const buggyCode = generateBuggyCode(language, pitfalls[0]);
    const correctFix = generateCorrectFix(language, pitfalls[0]);
    const wrongFixes = [
      "Add more comments to the code",
      "Change variable names to be longer",
      "Add console.log statements everywhere"
    ];
    
    const options = shuffleArray([correctFix, ...wrongFixes.slice(0, 3)]);
    const correctIndex = options.indexOf(correctFix);
    
    return {
      question: `What's wrong with this code snippet and how would you fix it?`,
      options,
      correct: correctIndex,
      hint: `Consider the common pitfall: ${pitfalls[0]}`,
      rationale: `The issue is: ${pitfalls[0]}. The correct fix is: ${correctFix}`,
      type: 'debug'
    };
  }
  
  return getDefaultDebugQuestion(language);
}

function generateBestPracticeQuestion(explanation: any, language: string): QuizQuestion {
  const refactors = explanation.refactors || [];
  
  if (refactors.length > 0) {
    const bestPractice = refactors[0];
    const wrongPractices = [
      "Remove all comments from the code",
      "Make all variables global",
      "Use single-letter variable names"
    ];
    
    const options = shuffleArray([bestPractice, ...wrongPractices.slice(0, 3)]);
    const correctIndex = options.indexOf(bestPractice);
    
    return {
      question: "Which would be the best improvement for this code?",
      options,
      correct: correctIndex,
      hint: "Think about code maintainability and best practices.",
      rationale: `Best practice: ${bestPractice}`,
      type: 'mcq'
    };
  }
  
  return getDefaultBestPracticeQuestion(language);
}

function generateBuggyCode(language: string, pitfall: string): string {
  // Simple buggy code examples based on common pitfalls
  const examples: { [key: string]: string } = {
    python: "if x = 5:",  // assignment instead of comparison
    javascript: "if (x = 5)",  // assignment instead of comparison
    java: "if (x = 5)",
    cpp: "if (x = 5)"
  };
  
  return examples[language] || examples.javascript;
}

function generateCorrectFix(language: string, pitfall: string): string {
  if (pitfall.includes('assignment') || pitfall.includes('comparison')) {
    return "Use == for comparison instead of = for assignment";
  }
  if (pitfall.includes('null') || pitfall.includes('undefined')) {
    return "Add null/undefined checks before using variables";
  }
  if (pitfall.includes('array') || pitfall.includes('bounds')) {
    return "Check array bounds before accessing elements";
  }
  return "Add proper error handling and validation";
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fallback questions for when generation fails
function getFallbackQuiz(language: string): Quiz {
  return {
    questions: [
      {
        question: `What is the main purpose of this ${language} code?`,
        options: [
          "To process and manipulate data",
          "To create a user interface",
          "To manage database connections",
          "To handle network requests"
        ],
        correct: 0,
        hint: "Look at the main operations being performed.",
        rationale: "Most code snippets are designed to process and manipulate data in some way.",
        type: 'mcq'
      },
      {
        question: "Which programming concept is most important for understanding this code?",
        options: ["Variables and data types", "Network protocols", "Database schemas", "UI frameworks"],
        correct: 0,
        hint: "Think about the fundamental building blocks of programming.",
        rationale: "Variables and data types are essential for understanding most code.",
        type: 'mcq'
      },
      {
        question: "What should you do before running this code?",
        options: [
          "Understand the input requirements",
          "Install a web server",
          "Set up a database",
          "Create user accounts"
        ],
        correct: 0,
        hint: "Think about what the code needs to work properly.",
        rationale: "Understanding input requirements helps prevent runtime errors.",
        type: 'mcq'
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
        rationale: "Comments and descriptive names make code much easier to read and maintain.",
        type: 'mcq'
      },
      {
        question: "What's a good practice when writing similar code?",
        options: [
          "Test with different inputs and handle edge cases",
          "Never add comments",
          "Use random variable names",
          "Ignore error handling"
        ],
        correct: 0,
        hint: "Think about code reliability and maintainability.",
        rationale: "Testing and error handling are crucial for robust code.",
        type: 'mcq'
      }
    ]
  };
}

function getDefaultWhatDoesItDoQuestion(language: string): QuizQuestion {
  return {
    question: `What is the main purpose of this ${language} code?`,
    options: [
      "Processes data according to specific logic",
      "Creates a graphical user interface",
      "Manages database connections",
      "Handles file system operations"
    ],
    correct: 0,
    hint: "Look at the overall structure and main operations.",
    rationale: "Most code examples focus on data processing and logical operations.",
    type: 'mcq'
  };
}

function getDefaultConceptQuestion(language: string): QuizQuestion {
  return {
    question: "What is a variable in programming?",
    options: [
      "A named storage location that holds data",
      "A type of loop structure",
      "A method for creating functions",
      "A way to connect to databases"
    ],
    correct: 0,
    hint: "Think about how data is stored and referenced in programs.",
    rationale: "Variables are fundamental storage containers that hold data values and can be referenced by name.",
    type: 'mcq'
  };
}

function getDefaultPredictQuestion(language: string): QuizQuestion {
  return {
    question: "What would happen if you run this code with valid input?",
    options: [
      "It would execute successfully and produce output",
      "It would crash immediately",
      "It would run forever in an infinite loop",
      "It would do nothing and exit silently"
    ],
    correct: 0,
    hint: "Assume the code is written correctly for its intended purpose.",
    rationale: "Well-written code with valid input should execute successfully and produce the expected output.",
    type: 'predict'
  };
}

function getDefaultDebugQuestion(language: string): QuizQuestion {
  return {
    question: "What's the most important thing to check when debugging code?",
    options: [
      "Variable values and program flow",
      "The color scheme of the editor",
      "The size of the code file",
      "The programming language version"
    ],
    correct: 0,
    hint: "Think about what causes most programming errors.",
    rationale: "Most bugs are caused by incorrect variable values or unexpected program flow, so these should be checked first.",
    type: 'debug'
  };
}

function getDefaultBestPracticeQuestion(language: string): QuizQuestion {
  return {
    question: "Which is the best practice for writing maintainable code?",
    options: [
      "Use clear, descriptive names and add helpful comments",
      "Write everything in a single function",
      "Use the shortest possible variable names",
      "Avoid any form of documentation"
    ],
    correct: 0,
    hint: "Think about what makes code easier for others (and future you) to understand.",
    rationale: "Clear naming and good documentation are essential for code that others can understand and maintain.",
    type: 'mcq'
  };
}