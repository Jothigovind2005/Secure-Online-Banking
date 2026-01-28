export const ADDITIONAL_SAMPLES = [
  {
    name: "Two Sum Problem",
    language: "python",
    code: `def two_sum(nums, target):
    hash_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in hash_map:
            return [hash_map[complement], i]
        
        hash_map[num] = i
    
    return []

# Example usage
result = two_sum([2, 7, 11, 15], 9)
print(result)  # Output: [0, 1]`
  },
  {
    name: "Simple API Route",
    language: "javascript",
    code: `const express = require('express');
const app = express();

app.use(express.json());

// GET endpoint
app.get('/api/users', (req, res) => {
    const users = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];
    res.json(users);
});

// POST endpoint
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email required' });
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email
    };
    
    res.status(201).json(newUser);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});`
  },
  {
    name: "Quick Sort Algorithm",
    language: "java",
    code: `public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        
        swap(arr, i + 1, high);
        return i + 1;
    }
    
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        quickSort(arr, 0, arr.length - 1);
        
        for (int num : arr) {
            System.out.print(num + " ");
        }
    }
}`
  },
  {
    name: "Simple SQL Queries",
    language: "sql",
    code: `-- Create a users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Carol Davis', 'carol@example.com');

-- Query all users
SELECT * FROM users;

-- Find users created in the last 7 days
SELECT name, email, created_at 
FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Count total users
SELECT COUNT(*) as total_users FROM users;`
  },
  {
    name: "React Component",
    language: "typescript",
    code: `import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  initialUsers?: User[];
}

const UserList: React.FC<UserListProps> = ({ initialUsers = [] }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const userData: User[] = await response.json();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;`
  }
];

export const getAllSamples = () => {
  const baseSamples = [
    {
      name: "FizzBuzz",
      language: "python",
      code: `def fizz_buzz(n):
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)

fizz_buzz(20)`
    },
    {
      name: "Binary Search",
      language: "javascript",
      code: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9], 5));`
    }
  ];

  return [...baseSamples, ...ADDITIONAL_SAMPLES];
};