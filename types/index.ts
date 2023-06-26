import { Problem, Submission } from "@prisma/client";
import { Result } from "compile-run";

export interface IProblemWithSubmissions extends Problem {
  submissions?: Submission[];
}

export type Lang = "js" | "py" | "cpp" | "c" | "java";

export interface ITestCase {
  input: string;
  output: string;
  isPublic: boolean;
  explanation?: string;
  actualOutput?: string;
  isCorrect?: boolean;
}

export interface ITestCasesResult extends ITestCase, Result {
  results: any[];
  isCorrect: boolean;
  passedCount: number;
  totalCount: number;
}

export interface ISubmissionResult extends ITestCasesResult {
  testcaseResults: any[];
  submissionId: number;
}
