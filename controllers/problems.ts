import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const problems = [
    {
      id: 1,
      topic: "basic",
      title: "Program to print 'hello world'",
      description: "Write a program to print 'hello world'",
      diffLevel: "very easy",
      testCases: [
        {
          inputFront: "",
          input: "",
          output: "hello world",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
      ],
    },
    {
      id: 2,
      topic: "basic",
      title: "Program to Swap two Numbers",
      description: `Your task is to input two numbers from the user, swap them and print their values.
        <br><br>
        Hint: you can use following code to take input from user
        <br>
        <code>a = int(input())<br>b = int(input())</code>
        `,
      diffLevel: "very easy",
      testCases: [
        {
          inputFront: "10<br>20",
          input: "10\n20",
          output: "20 10",
          explaination: "After swapping a = 20, b = 10",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          inputFront: "120<br>50",
          input: "120\n50",
          output: "50 120",
          explaination: "After swapping a = 50, b = 120",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
      ],
    },
    {
      id: 3,
      title: "Print alternate numbers",
      diffLevel: "easy",
      topic: "loops",
      description:
        `Ask the user to enter a number and print the odd numbers from 1 to next 
        n odd numbers`,
      testCases: [
        {
          input: "5",
          inputFront: "5",
          output: "1 3 5 7 9",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "10",
          inputFront: "10",
          output: "1 3 5 7 9 11 13 15 17 19",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "15",
          inputFront: "15",
          output: "1 3 5 7 9 11 13 15 17 19 21 23 25 27 29",
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
    {
      id: 4,
      topic: "conditionals",
      title: "Eligibility for vote",
      description: `Raju is a responsible citizen, he wants to check whether he is eligible to vote in the upcoming elections.
         Take Raju's age as an input then print '<code>eligible</code>' if he is over or equal to 18, else print '<code>not eligible</code>'`,
      diffLevel: "easy",
      testCases: [
        {
          input: "5",
          inputFront: "5",
          output: "not eligible",
          explaination: "Age is less than 18, so raju cant vote",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "18",
          inputFront: "18",
          output: "eligible",
          explaination: "Age is equal to 18, so raju can vote",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "43",
          inputFront: "43",
          output: "eligible",
          explaination: "Age is far greater than 18, so raju can vote",
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
    {
      id: 5,
      topic: "strings",
      title: "Vowels Count",
      description: `Print the total number of vowels in a string inputted by a user<br><br>
      Hint: you can use a variable like <br><code>vowels = ['a','e','i','o','u']</code><br>
      and check if a character is in the vowels array like this <br><code>if char in vowels:</code> 
      `,
      diffLevel: "easy",
      testCases: [
        {
          input: "miss cse",
          inputFront: "miss cse",
          output: "2",
          explaination: "vowels are [i, e]",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "pulihora",
          inputFront: "pulihora",
          output: "4",
          explaination: "vowels are [u, i, o, a]",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "elephant",
          inputFront: "elephant",
          output: "3",
          explaination: "vowels are [e, e, a]",
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
  
    {
      id: 6,
      topic: "strings",
      title: "Capitalized words",
      description: `Take a string from the user and print words starting with capital letter<br><br>
      Hint: you can use python str methods to solve the problem like <br> <code>split()</code>,<br> <code>replace()</code>,<br> <code>upper()</code> 
      `,
      diffLevel: "easy",
      testCases: [
        {
          input: "Miss CSE, the Pride of our College",
          inputFront: "Miss CSE, the Pride of our College",
          output: "Miss CSE Pride College",
          explaination:
            "Miss CSE Pride College are the only words starting with capital letter",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "Python programming is Fun and Easy",
          inputFront: "Python programming is Fun and Easy",
          output: "Python Fun Easy",
          explaination:
            "Python Fun Easy are the only words starting with capital letter",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "Is Veeresh is a Decent guy?",
          inputFront: "Is Veeresh is a Decent guy?",
          output: "Is Veeresh Decent",
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
    {
      id: 7,
      topic: "loops",
      title: "Program to print n fibonacci numbers",
      description: `Take a value from the user, call it n and print the first n fibonacci 
      numbers in a single line separated by spaces<br><br>
      Hint: <code>f<sub>n</sub> = f<sub>n-1</sub> + f<sub>n-2</sub></code><br>
      meaning, current fibonacci number is the sum of the previous two fibonacci numbers
      `,
      diffLevel: "medium",
      testCases: [
        {
          input: "7",
          inputFront: "7",
          output: "0 1 1 2 3 5 8",
          expected: true,
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "10",
          inputFront: "10",
          output: "0 1 1 2 3 5 8 13 21 34",
          expected: true,
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "20",
          inputFront: "20",
          output:
            "0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597 2584 4181",
          expected: true,
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
    {
      id: 8,
      topic: "strings",
      title: "Convert binary to decimal",
      description: `Create a calculator that takes a binary input from the user and prints its decimal equivalent.<br>
        Hint: <code>101<sub>2</sub> = 5<sub>10</sub></code>`,
      diffLevel: "medium",
      testCases: [
        {
          input: "1010",
          inputFront: "1010",
          output: "10",
          explaination: "1010 = 1*2^3 + 0*2^2 + 1*2^1 + 0*2^0 = 10",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "1111",
          inputFront: "1111",
          output: "15",
          explaination: "1111 = 1*2^4 + 1*2^3 + 1*2^2 + 1*2^1 + 1*2^0 = 15",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "10001",
          inputFront: "10001",
          output: "17",
          explaination:
            "10001 = 1*2^5 + 0*2^4 + 0*2^3 + 0*2^2 + 0*2^1 + 1*2^0 = 21",
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
    {
      id: 9,
      topic: "loops",
      title: "Fizz Buzz",
      description: `Write a program that takes input <code>n</code> and prints the numbers from 1 to n in a single line. But 
      <ul> <li>for multiples of three print "Fizz" instead of the number</li> <li>for multiples of five print "Buzz"</li> <li>for multiples of both three and five print "FizzBuzz"</li> </ul>`,
      diffLevel: "easy",
      testCases: [
        {
          input: "10",
          inputFront: "10",
          output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz",
          explaination:
            "3, 6 and 9 are divisible by 3 | 5 and 10 are divisible by 5,",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "15",
          inputFront: "15",
          output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz",
          explaination:
            "3, 6, 9, 12, 15 are divisible by 3 | 5, 10 and 15 are divisible by 5 | 15 is divisible by both 3 and 5",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "100",
          inputFront: "100",
          output:
            "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz 16 17 Fizz 19 Buzz Fizz 22 23 Fizz Buzz 26 Fizz 28 29 FizzBuzz 31 32 Fizz 34 Buzz Fizz 37 38 Fizz Buzz 41 Fizz 43 44 FizzBuzz 46 47 Fizz 49 Buzz Fizz 52 53 Fizz Buzz 56 Fizz 58 59 FizzBuzz 61 62 Fizz 64 Buzz Fizz 67 68 Fizz Buzz 71 Fizz 73 74 FizzBuzz 76 77 Fizz 79 Buzz Fizz 82 83 Fizz Buzz 86 Fizz 88 89 FizzBuzz 91 92 Fizz 94 Buzz Fizz 97 98 Fizz Buzz",
          hidden: true,
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
      ],
    },
    {
      id: 10,
      topic: "Funtions",
      title: "ATM Machine - Withdrawal",
  
      description: `Design a logic for an ATM machine to withdraw money, 
      <ul>
      <li>The machine can to take balance amount and withdraw the amount from the user.</li>
      <li>The machine can only take a minimum balance of Rs. 1000.</li>
      <li>The machine should charge a fees of Rs. 50 for each withdrawal.</li>
      If the transaction is successful, the machine should display the amount withdrawn and the balance amount.
      </ul>
      If the transaction is unsuccessful, the machine should display the error message as 'transaction failed'.
      <br><br>input format: <br><code>first line would be for balance and <br>second for withdraw amount</code>.
  `,
      diffLevel: "hard",
      testCases: [
        {
          input: "500\n200",
          inputFront: "500<br>200",
          output: "transaction failed",
          explaination:
            "The minimum balance is Rs. 1000. Hence, the transaction is unsuccessful.",
          testCase: "Test Case 1",
          testCaseDescription: "Test Case 1",
          testCaseNumber: 1,
        },
        {
          input: "1500\n2000",
          inputFront: "1500<br>2000",
          output: "transaction failed",
          explaination:
            "The withdrawal amount is greater than the balance amount. Hence, the transaction is unsuccessful.",
          testCase: "Test Case 2",
          testCaseDescription: "Test Case 2",
          testCaseNumber: 2,
        },
        {
          input: "2000\n500",
          inputFront: "2000<br>500",
          output: "Withdrawn: 500, Balance: 1450",
          explaination: `The (widthdraw amount + fees) is less than the balance, so the transaction is successful and 50 
          is also deducted`,
          testCase: "Test Case 3",
          testCaseDescription: "Test Case 3",
          testCaseNumber: 3,
        },
        {
          input: "1000\n1000",
          inputFront: "1000<br>1000",
          output: "transaction failed",
          explaination: `The (widthdraw amount + fees) is more than the balance. Hence, transaction is unsucessful`,
          testCase: "Test Case 4",
          testCaseDescription: "Test Case 4",
          testCaseNumber: 4,
        },
      ],
    },
  ];
  

export const getAllProblems = async (req: Request, res: Response) => {
    const { userID } = req.params;
    try {
        res.json(problems)

    } catch (err) {
        console.log(err)
        res.status(404).json({ message: 'somethings wrong' })
    }
}