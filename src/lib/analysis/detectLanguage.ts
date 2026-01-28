interface LanguagePattern {
  id: string;
  name: string;
  patterns: RegExp[];
  keywords: string[];
}

const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    id: 'python',
    name: 'Python',
    patterns: [
      /def\s+\w+\s*\(/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /if\s+__name__\s*==\s*['""]__main__['""]:/,
      /^\s*#.*$/m,
      /print\s*\(/,
      /:\s*$/m
    ],
    keywords: ['def', 'import', 'from', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'with', 'lambda', 'yield']
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    patterns: [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /=>\s*{/,
      /console\.log\s*\(/,
      /require\s*\(/,
      /module\.exports/
    ],
    keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'async', 'await', 'import', 'export']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    patterns: [
      /:\s*(string|number|boolean|object)/,
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /function\s+\w+\s*\([^)]*:\s*\w+/,
      /const\s+\w+:\s*\w+/,
      /<\w+>/,
      /as\s+\w+/
    ],
    keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'implements', 'extends', 'abstract', 'private', 'public', 'protected']
  },
  {
    id: 'java',
    name: 'Java',
    patterns: [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.print/,
      /import\s+java\./,
      /package\s+\w+/,
      /@\w+/,
      /\w+\s+\w+\s*\([^)]*\)\s*{/
    ],
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'abstract', 'synchronized']
  },
  {
    id: 'cpp',
    name: 'C++',
    patterns: [
      /#include\s*<\w+>/,
      /using\s+namespace\s+std/,
      /int\s+main\s*\(/,
      /cout\s*<</, 
      /cin\s*>>/,
      /std::/,
      /template\s*</
    ],
    keywords: ['#include', 'using', 'namespace', 'class', 'struct', 'template', 'public', 'private', 'protected', 'virtual', 'override']
  },
  {
    id: 'go',
    name: 'Go',
    patterns: [
      /package\s+main/,
      /func\s+main\s*\(/,
      /import\s+\(/,
      /fmt\.Print/,
      /var\s+\w+\s+\w+/,
      /:=/,
      /func\s+\w+\s*\(/
    ],
    keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'go', 'defer', 'chan', 'select']
  },
  {
    id: 'sql',
    name: 'SQL',
    patterns: [
      /SELECT\s+.+\s+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+.+\s+SET/i,
      /DELETE\s+FROM/i,
      /CREATE\s+TABLE/i,
      /ALTER\s+TABLE/i,
      /DROP\s+TABLE/i
    ],
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'JOIN', 'INNER', 'LEFT', 'RIGHT']
  },
  {
    id: 'html',
    name: 'HTML',
    patterns: [
      /<html/i,
      /<head>/i,
      /<body>/i,
      /<div/i,
      /<p>/i,
      /<script/i,
      /<style/i,
      /<!DOCTYPE/i
    ],
    keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'script', 'style', 'link']
  },
  {
    id: 'css',
    name: 'CSS',
    patterns: [
      /\w+\s*{\s*[\w-]+:\s*[^}]+}/,
      /@media/,
      /@import/,
      /@keyframes/,
      /\.\w+\s*{/,
      /#\w+\s*{/,
      /:\s*(hover|focus|active)/
    ],
    keywords: ['color', 'background', 'margin', 'padding', 'border', 'font', 'display', 'position', 'width', 'height']
  }
];

export function detectLanguage(code: string): string {
  if (!code || !code.trim()) {
    return 'javascript'; // Default fallback
  }

  const scores: { [key: string]: number } = {};

  // Initialize scores
  LANGUAGE_PATTERNS.forEach(lang => {
    scores[lang.id] = 0;
  });

  // Score based on regex patterns
  LANGUAGE_PATTERNS.forEach(lang => {
    lang.patterns.forEach(pattern => {
      if (pattern.test(code)) {
        scores[lang.id] += 2;
      }
    });

    // Score based on keyword frequency
    lang.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = code.match(regex);
      if (matches) {
        scores[lang.id] += matches.length;
      }
    });
  });

  // Additional heuristics
  
  // Python-specific indentation patterns
  if (/^\s{4}/m.test(code) && !/[{}]/g.test(code)) {
    scores.python += 3;
  }

  // JavaScript/TypeScript specific
  if (code.includes('=>') || code.includes('===')) {
    scores.javascript += 2;
    scores.typescript += 1;
  }

  // TypeScript specific type annotations
  if (/:\s*(string|number|boolean)/g.test(code)) {
    scores.typescript += 4;
  }

  // C-style braces
  if (/{[\s\S]*}/g.test(code)) {
    scores.java += 1;
    scores.cpp += 1;
    scores.javascript += 1;
    scores.typescript += 1;
  }

  // Find the language with the highest score
  let maxScore = 0;
  let detectedLanguage = 'javascript'; // Default fallback

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = lang;
    }
  });

  // If no clear winner, apply additional logic
  if (maxScore === 0) {
    // Check for common file patterns in the code content
    if (code.includes('function') && code.includes('var') || code.includes('let') || code.includes('const')) {
      return 'javascript';
    }
    if (code.includes('def ') && code.includes(':')) {
      return 'python';
    }
    if (code.includes('public class')) {
      return 'java';
    }
  }

  return detectedLanguage;
}

export function getLanguageInfo(languageId: string) {
  const language = LANGUAGE_PATTERNS.find(lang => lang.id === languageId);
  return language ? { id: language.id, name: language.name } : { id: 'javascript', name: 'JavaScript' };
}