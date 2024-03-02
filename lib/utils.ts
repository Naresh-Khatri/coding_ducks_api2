import { Directory, File } from "@prisma/client";
import { IFile } from "../socketio/events-types";

export const pointsToLeague = (points: number) => {
  if (points < 10) return { id: "noob", label: "Noob" };
  else if (points < 50) return { id: "beginner", label: "Beginner" };
  else if (points < 100) return { id: "intermediate", label: "Intermediate" };
  else if (points < 200) return { id: "advance", label: "Advance" };
  else if (points < 300) return { id: "expert", label: "Expert" };
  else if (points < 450) return { id: "master", label: "Master" };
  else return { id: "grandmaster", label: "Grand Master" };
};

export const getRandomColor = (
  takenColors: { name: string; value: string }[]
): { name: string; value: string } => {
  const colors = [
    { name: "purple", value: "#9F7AEA" },
    { name: "pink", value: "#ED64A6" },
    { name: "green", value: "#48BB78" },
    { name: "yellow", value: "#ECC94B" },
    { name: "orange", value: "#ED8936" },
    { name: "red", value: "#F56565" },
    { name: "teal", value: "#38B2AC" },
    { name: "blue", value: "#4299E1" },
    { name: "cyan", value: "#0BC5EA" },
  ];

  for (let i = 0; i < colors.length; i++) {
    if (takenColors.some((color) => color.name === colors[i].name)) continue;
    return colors[i];
  }
  return colors[0];
};

export const generateTree = ({
  dirs,
  rootFiles,
}: {
  dirs: Directory[];
  rootFiles: IFile[];
}) => {
  const foo = {
    id: -1,
    name: "/",
    childDirs: dirs.map((dir) => ({ ...dir, parentDirId: -1 })),
    files: rootFiles,
  };
  console.log(foo);
};
