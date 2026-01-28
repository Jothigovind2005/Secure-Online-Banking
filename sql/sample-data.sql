-- Sample data for testing
-- Note: These inserts will only work if you have a user with the specified UUID
-- Replace 'your-user-uuid-here' with an actual user UUID from your auth.users table

-- Sample Python snippet
INSERT INTO snippets (
  id,
  owner,
  title,
  language,
  code,
  explanation,
  mermaid_diagram,
  trace_table,
  status
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'your-user-uuid-here',
  'Fibonacci Function',
  'python',
  'def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
print(fibonacci(10))',
  'This Python function calculates the nth Fibonacci number using recursion. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones. The function uses a base case for numbers 0 and 1, returning the number itself. For larger numbers, it recursively calls itself with n-1 and n-2, then adds the results together.',
  'graph TD
    A[Start] --> B[Check if n <= 1]
    B -->|True| C[Return n]
    B -->|False| D[Calculate fibonacci(n-1)]
    D --> E[Calculate fibonacci(n-2)]
    E --> F[Add results]
    F --> G[Return sum]
    C --> H[End]
    G --> H',
  '{"input": "5", "steps": [{"line": 1, "vars": {"n": 5}}, {"line": 2, "vars": {"n": 5, "condition": false}}, {"line": 3, "vars": {"n": 5, "result": 5}}]}',
  'ready'
);

-- Sample quizzes for the Fibonacci snippet
INSERT INTO quizzes (snippet_id, question, choices, answer, hint, difficulty) VALUES
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'What is the base case for the Fibonacci function?',
  '["n <= 1", "n == 0", "n < 2", "n >= 1"]',
  'n <= 1',
  'Look at the condition in the if statement',
  'easy'
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'What type of algorithm approach does this function use?',
  '["Iteration", "Recursion", "Dynamic Programming", "Greedy"]',
  'Recursion',
  'Notice how the function calls itself',
  'medium'
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'What would fibonacci(3) return?',
  '["1", "2", "3", "5"]',
  '2',
  'Trace through: fibonacci(3) = fibonacci(2) + fibonacci(1) = 1 + 1 = 2',
  'hard'
);

-- Sample JavaScript snippet
INSERT INTO snippets (
  id,
  owner,
  title,
  language,
  code,
  explanation,
  mermaid_diagram,
  trace_table,
  status
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'your-user-uuid-here',
  'Array Filter Example',
  'javascript',
  'const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers);',
  'This JavaScript code demonstrates array filtering. It creates an array of numbers from 1 to 10, then uses the filter method to create a new array containing only even numbers. The filter method calls the provided function for each element and includes only those elements where the function returns true.',
  'graph TD
    A[Start] --> B[Create numbers array]
    B --> C[Call filter method]
    C --> D[Check each number]
    D --> E{Is number even?}
    E -->|True| F[Include in result]
    E -->|False| G[Skip number]
    F --> H[Continue to next]
    G --> H
    H --> I{More numbers?}
    I -->|Yes| D
    I -->|No| J[Return filtered array]
    J --> K[Log result]
    K --> L[End]',
  '{"input": "[1,2,3,4,5,6,7,8,9,10]", "steps": [{"line": 1, "vars": {"numbers": "[1,2,3,4,5,6,7,8,9,10]"}}, {"line": 2, "vars": {"numbers": "[1,2,3,4,5,6,7,8,9,10]", "evenNumbers": "[2,4,6,8,10]"}}]}',
  'ready'
);

-- Sample quizzes for the JavaScript snippet
INSERT INTO quizzes (snippet_id, question, choices, answer, hint, difficulty) VALUES
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'What does the filter method do?',
  '["Modifies the original array", "Creates a new array with elements that pass a test", "Sorts the array", "Reverses the array"]',
  'Creates a new array with elements that pass a test',
  'The filter method creates a new array',
  'easy'
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'What does num % 2 === 0 check for?',
  '["Odd numbers", "Even numbers", "Prime numbers", "Negative numbers"]',
  'Even numbers',
  'The modulo operator % gives the remainder of division',
  'medium'
),
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'What will be logged to the console?',
  '["[1,3,5,7,9]", "[2,4,6,8,10]", "[1,2,3,4,5,6,7,8,9,10]", "undefined"]',
  '[2,4,6,8,10]',
  'Only even numbers pass the filter test',
  'hard'
);