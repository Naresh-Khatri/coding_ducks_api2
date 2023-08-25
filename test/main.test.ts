import { expect, test } from "vitest";
import { execCode } from "../turbodrive";

test("check cpp: hello world", async () => {
  await expect(runCppHello()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    passed: expect.any(Number),
    total: expect.any(Number),
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        errorType: null,
        exitCode: 0,
        memoryUsage: expect.any(Number),
        runtime: expect.any(Number),
        signal: null,
        stdout: "hello world",
        stdin: "",
        stderr: "",
      },
    ]),
  });
});
test("check cpp: input", async () => {
  await expect(runCppInput()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    total: 1,
    passed: 1,
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        stdout: "hello naresh khatri",
        stdin: "naresh khatri",
        stderr: "",
        exitCode: 0,
        runtime: expect.any(Number),
        signal: null,
        errorType: null,
        memoryUsage: expect.any(Number),
      },
    ]),
  });
});
test("check cpp: syntax error", async () => {
  await expect(runCppSyntaError()).resolves.toMatchObject({
    err: expect.any(Object),
    stdout: "",
    stderr: expect.any(String),
    compileTime: expect.any(Number),
  });
});
test("check cpp: divide by zero", async () => {
  await expect(runCppDividebyZero()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    total: 1,
    passed: 0,
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        stdout: "",
        stderr: "",
        exitCode: 0,
        runtime: expect.any(Number),
        signal: "SIGFPE",
        stdin: "",
        errorType: "run-time",
        memoryUsage: expect.any(Number),
      },
    ]),
  });
});
test("check cpp: infinite loop", async () => {
  await expect(runCppInfiniteLoop()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    total: 1,
    passed: 0,
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        stdout: "",
        stderr: "",
        exitCode: 0,
        runtime: expect.any(Number),
        signal: "SIGTERM",
        stdin: "",
        errorType: "run-timeout",
        memoryUsage: expect.any(Number),
      },
    ]),
  });
});

test("check java: hello world", async () => {
  await expect(runJavaHelloWorld()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    passed: expect.any(Number),
    total: expect.any(Number),
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        errorType: null,
        exitCode: 0,
        memoryUsage: expect.any(Number),
        runtime: expect.any(Number),
        signal: null,
        stdout: "hello world",
        stdin: "",
        stderr: "",
      },
    ]),
  });
});
test("check java: input", async () => {
  await expect(runJavaInput()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    total: 1,
    passed: 1,
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        stdout: "hello naresh khatri",
        stdin: "naresh khatri",
        stderr: "",
        exitCode: 0,
        runtime: expect.any(Number),
        signal: null,
        errorType: null,
        memoryUsage: expect.any(Number),
      },
    ]),
  });
});
test("check java: syntax error", async () => {
  await expect(runJavaSyntaxError()).resolves.toMatchObject({
    err: expect.any(Object),
    stdout: "",
    stderr: expect.any(String),
    compileTime: expect.any(Number),
  });
});
test("check java: divide by zero", async () => {
  await expect(runJavaDivideByZero()).resolves.toMatchObject({
    compileTime: expect.any(Number),
    total: 1,
    passed: 0,
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        stdout: "",
        stderr: expect.any(String),
        exitCode: 1,
        runtime: expect.any(Number),
        signal: null,
        stdin: "",
        errorType: "run-time",
        memoryUsage: expect.any(Number),
      },
    ]),
  });
  //   stdout: "",
  //   exitCode: 1,
  //   signal: null,
  //   errorType: "run-time",
  // });
});
test("check java: infinite loop", async () => {
  await expect(runJavaInfiniteLoop()).resolves.toMatchObject({

    compileTime: expect.any(Number),
    total: 1,
    passed: 0,
    totalRuntime: expect.any(Number),
    results: expect.arrayContaining([
      {
        stdout: "",
        stderr: "",
        exitCode: 143,
        runtime: expect.any(Number),
        signal: "SIGTERM",
        stdin: "",
        errorType: "run-timeout",
        memoryUsage: expect.any(Number),
      },
    ]),
  });
});

const runJavaInfiniteLoop = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "java",
      code: `class Main {
    public static void main(String[] args) {
      while(true) {}
    }
}`,
      inputs: [""],
      options: { timeout: 1000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runJavaInput = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "java",
      code: `import java.util.Scanner;
      class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String name = sc.nextLine();
    System.out.print("hello " + name);
  }
}`,
      inputs: ["naresh khatri"],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runJavaDivideByZero = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "java",
      code: `class Main {
    public static void main(String[] args) {
        int i = 9 / 0;
        System.out.print("hello world");
    }
}`,
      inputs: [""],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runJavaSyntaxError = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "java",
      code: `class Main {
    public static void main(String[] args) {
        System.out.print("hello world")
    }
}`,
      inputs: [""],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runJavaHelloWorld = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "java",
      code: `class Main {
    public static void main(String[] args) {
        System.out.print("hello world");
    }
}`,
      inputs: [""],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runCppInfiniteLoop = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "cpp",
      code: `#include <bits/stdc++.h>
                    using namespace std;
                    int main() {
                        while(1){}
                        return 0;
                    }`,
      inputs: [""],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runCppDividebyZero = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "cpp",
      code: `#include <bits/stdc++.h>
                    using namespace std;
                    int main() {
                        cout<<1/0;
                        return 0;
                    }`,
      inputs: [""],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};

const runCppSyntaError = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "cpp",
      code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    cout<<"hello world"
    return 0;
}`,
      inputs: [""],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runCppInput = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "cpp",
      code: `#include <bits/stdc++.h>
                    using namespace std;
                    int main() {
                        string name;
                        getline(cin, name);
                        cout<<"hello "<<name;
                        return 0;
                    }`,
      inputs: ["naresh khatri"],
      options: { timeout: 2000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
const runCppHello = () => {
  return new Promise(async (resolve, reject) => {
    const res = await execCode({
      lang: "cpp",
      code: `#include <bits/stdc++.h>
                    using namespace std;
                    int main() {
                        cout<<"hello world";
                        return 0;
                    }`,
      inputs: [""],
      options: { timeout: 3000, maxBuffer: 1024 * 1024 * 1024 },
    });
    return resolve(res);
  });
};
