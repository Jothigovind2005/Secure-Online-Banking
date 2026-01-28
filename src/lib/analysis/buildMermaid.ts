export function buildMermaidDiagram(code: string, language: string): string {
  try {
    // Analyze the code structure and generate appropriate Mermaid diagram
    const structure = analyzeCodeStructure(code, language);
    return generateMermaidFromStructure(structure, language);
  } catch (error) {
    console.error('Error building Mermaid diagram:', error);
    return getDefaultDiagram();
  }
}

interface CodeStructure {
  hasLoops: boolean;
  hasConditionals: boolean;
  hasFunctions: boolean;
  hasClasses: boolean;
  mainFlow: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

function analyzeCodeStructure(code: string, language: string): CodeStructure {
  const structure: CodeStructure = {
    hasLoops: false,
    hasConditionals: false,
    hasFunctions: false,
    hasClasses: false,
    mainFlow: [],
    complexity: 'simple'
  };

  // Detect language-specific patterns
  const patterns = {
    loops: getLoopPatterns(language),
    conditionals: getConditionalPatterns(language),
    functions: getFunctionPatterns(language),
    classes: getClassPatterns(language)
  };

  // Check for different constructs
  structure.hasLoops = patterns.loops.some(pattern => pattern.test(code));
  structure.hasConditionals = patterns.conditionals.some(pattern => pattern.test(code));
  structure.hasFunctions = patterns.functions.some(pattern => pattern.test(code));
  structure.hasClasses = patterns.classes.some(pattern => pattern.test(code));

  // Analyze main flow
  structure.mainFlow = extractMainFlow(code, language);

  // Determine complexity
  let complexityScore = 0;
  if (structure.hasLoops) complexityScore += 2;
  if (structure.hasConditionals) complexityScore += 1;
  if (structure.hasFunctions) complexityScore += 1;
  if (structure.hasClasses) complexityScore += 2;

  structure.complexity = complexityScore <= 2 ? 'simple' : 
                        complexityScore <= 4 ? 'moderate' : 'complex';

  return structure;
}

function generateMermaidFromStructure(structure: CodeStructure, language: string): string {
  if (structure.complexity === 'simple' && !structure.hasLoops && !structure.hasConditionals) {
    return generateSimpleDiagram(structure);
  }

  if (structure.hasLoops && structure.hasConditionals) {
    return generateLoopConditionalDiagram(structure);
  }

  if (structure.hasLoops) {
    return generateLoopDiagram(structure);
  }

  if (structure.hasConditionals) {
    return generateConditionalDiagram(structure);
  }

  if (structure.hasFunctions) {
    return generateFunctionDiagram(structure);
  }

  return generateSimpleDiagram(structure);
}

function generateSimpleDiagram(structure: CodeStructure): string {
  return `graph TD
    A[Start] --> B[Initialize Variables]
    B --> C[Process Data]
    C --> D[Return Result]
    D --> E[End]`;
}

function generateLoopConditionalDiagram(structure: CodeStructure): string {
  return `graph TD
    A[Start] --> B[Initialize Loop Variable]
    B --> C[Check Loop Condition]
    C -->|True| D[Check Inner Condition]
    D -->|Condition Met| E[Execute Action A]
    D -->|Condition Not Met| F[Check Next Condition]
    F -->|Condition Met| G[Execute Action B]
    F -->|Condition Not Met| H[Execute Default Action]
    E --> I[Update Loop Variable]
    G --> I
    H --> I
    I --> C
    C -->|False| J[End]`;
}

function generateLoopDiagram(structure: CodeStructure): string {
  return `graph TD
    A[Start] --> B[Initialize Counter]
    B --> C[Check Loop Condition]
    C -->|True| D[Execute Loop Body]
    D --> E[Update Counter]
    E --> C
    C -->|False| F[End]`;
}

function generateConditionalDiagram(structure: CodeStructure): string {
  return `graph TD
    A[Start] --> B[Check Condition 1]
    B -->|True| C[Execute Branch 1]
    B -->|False| D[Check Condition 2]
    D -->|True| E[Execute Branch 2]
    D -->|False| F[Execute Default Branch]
    C --> G[End]
    E --> G
    F --> G`;
}

function generateFunctionDiagram(structure: CodeStructure): string {
  return `graph TD
    A[Start] --> B[Call Function]
    B --> C[Function: Process Input]
    C --> D[Function: Apply Logic]
    D --> E[Function: Return Result]
    E --> F[Use Result]
    F --> G[End]`;
}

function getLoopPatterns(language: string): RegExp[] {
  const patterns: { [key: string]: RegExp[] } = {
    python: [/for\s+\w+\s+in/, /while\s+.+:/, /for\s+\w+\s*,?\s*\w*\s+in\s+range/],
    javascript: [/for\s*\([^)]*\)/, /while\s*\([^)]*\)/, /for\s*\(\s*\w+\s+(of|in)\s+/, /\.forEach\s*\(/],
    typescript: [/for\s*\([^)]*\)/, /while\s*\([^)]*\)/, /for\s*\(\s*\w+\s+(of|in)\s+/, /\.forEach\s*\(/],
    java: [/for\s*\([^)]*\)/, /while\s*\([^)]*\)/, /for\s*\(\s*\w+\s*:\s*\w+\s*\)/],
    cpp: [/for\s*\([^)]*\)/, /while\s*\([^)]*\)/, /do\s*{[\s\S]*?}\s*while/],
    go: [/for\s+[^{]*{/, /for\s+range/],
    sql: [/WHILE\s+/i]
  };
  return patterns[language] || patterns.javascript;
}

function getConditionalPatterns(language: string): RegExp[] {
  const patterns: { [key: string]: RegExp[] } = {
    python: [/if\s+.+:/, /elif\s+.+:/, /else\s*:/],
    javascript: [/if\s*\([^)]*\)/, /else\s+if\s*\([^)]*\)/, /else\s*{/, /\?\s*.*\s*:/],
    typescript: [/if\s*\([^)]*\)/, /else\s+if\s*\([^)]*\)/, /else\s*{/, /\?\s*.*\s*:/],
    java: [/if\s*\([^)]*\)/, /else\s+if\s*\([^)]*\)/, /else\s*{/, /switch\s*\([^)]*\)/],
    cpp: [/if\s*\([^)]*\)/, /else\s+if\s*\([^)]*\)/, /else\s*{/, /switch\s*\([^)]*\)/],
    go: [/if\s+[^{]*{/, /else\s+if\s+[^{]*{/, /else\s*{/, /switch\s+[^{]*{/],
    sql: [/CASE\s+WHEN/i, /IF\s*\(/i]
  };
  return patterns[language] || patterns.javascript;
}

function getFunctionPatterns(language: string): RegExp[] {
  const patterns: { [key: string]: RegExp[] } = {
    python: [/def\s+\w+\s*\(/],
    javascript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=\s*\([^)]*\)\s*=>/, /\w+\s*:\s*\([^)]*\)\s*=>/],
    typescript: [/function\s+\w+\s*\(/, /const\s+\w+\s*=\s*\([^)]*\)\s*=>/, /\w+\s*:\s*\([^)]*\)\s*=>/],
    java: [/\w+\s+\w+\s*\([^)]*\)\s*{/],
    cpp: [/\w+\s+\w+\s*\([^)]*\)\s*{/],
    go: [/func\s+\w+\s*\(/],
    sql: [/CREATE\s+FUNCTION/i, /CREATE\s+PROCEDURE/i]
  };
  return patterns[language] || patterns.javascript;
}

function getClassPatterns(language: string): RegExp[] {
  const patterns: { [key: string]: RegExp[] } = {
    python: [/class\s+\w+/],
    javascript: [/class\s+\w+/],
    typescript: [/class\s+\w+/, /interface\s+\w+/],
    java: [/class\s+\w+/, /interface\s+\w+/],
    cpp: [/class\s+\w+/, /struct\s+\w+/],
    go: [/type\s+\w+\s+struct/],
    sql: []
  };
  return patterns[language] || [];
}

function extractMainFlow(code: string, language: string): string[] {
  // This is a simplified version - could be enhanced with proper AST parsing
  const lines = code.split('\n').filter(line => line.trim());
  const flow: string[] = [];
  
  // Extract key operations based on language
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
      return; // Skip comments
    }
    
    // Look for significant operations
    if (trimmed.includes('print') || trimmed.includes('console.log') || trimmed.includes('cout')) {
      flow.push('Output Data');
    } else if (trimmed.includes('input') || trimmed.includes('scanf') || trimmed.includes('cin')) {
      flow.push('Get Input');
    } else if (trimmed.includes('return')) {
      flow.push('Return Result');
    } else if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=')) {
      flow.push('Assign Variable');
    }
  });
  
  return flow.length > 0 ? flow : ['Process Data'];
}

function getDefaultDiagram(): string {
  return `graph TD
    A[Start] --> B[Process Input]
    B --> C[Apply Logic]
    C --> D[Generate Output]
    D --> E[End]`;
}