import { Problem, Submission } from "@prisma/client";
import { Result } from "compile-run";

export interface IProblemWithSubmissions extends Problem {
  submissions?: Submission[];
}

export type Lang = "js" | "py" | "cpp" | "c" | "java" | "other";

export interface ITestCase {
  input: string;
  output: string;
  isPublic: boolean;
  explanation?: string;
  actualOutput?: string;
  isCorrect?: boolean;
}

export interface ITestCasesResult extends ITestCase {
  results: any[];
  isCorrect: boolean;
  passedCount: number;
  totalCount: number;
}

export interface ISubmissionResult extends ITestCasesResult {
  testcaseResults: any[];
  submissionId: number;
}

export interface IEvalResult {
  errorOccurred?: boolean;
  errorMessage?: string;
  errorType?: string;
  errorIndex?: number;
  input?: string;
  output?: string;
  actualOutput?: string;
  result?: Result;
  isPublic?: boolean;
  isCorrect?: boolean;
}

export type ILeague =
  | "noob"
  | "beginner"
  | "intermediate"
  | "advance"
  | "expert"
  | "master"
  | "grandmaster";
