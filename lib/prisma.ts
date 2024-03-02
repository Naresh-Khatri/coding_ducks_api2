import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

export const getRecursiveInclude = ({
  depth,
  obj,
}: {
  depth: number;
  obj: object;
}) => {
  const foo = {
    ...obj,
    childDirs: {
      include: {},
    },
  };
  let ans = JSON.stringify(foo);
  for (let i = 0; i < depth - 3; i++) {
    ans = ans.replace("{}", JSON.stringify(foo));
  }
  ans = ans.replace("{}", JSON.stringify({ ...obj, childDirs: true }));
  console.log(JSON.parse(ans));
  return JSON.parse(ans);
};
