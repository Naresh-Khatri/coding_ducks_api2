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

// TODO: add <head> support
export const generateHtmlString = ({
  html,
  css,
  js,
  isMobile = false,
}: {
  html: string;
  css: string;
  js: string;
  isMobile: boolean;
}) => {
  return `<html>
  <body>${html}</body>
  <style>${css}</style>
  <style>body{width:${isMobile ? "360px" : "1280px"}; height: ${
    isMobile ? "height: 640px" : "720px"
  }; margin: 0; overflow: hidden;}</style>
  <script>${js}</script>
</html>`;
};
export const generateOGHtmlString = ({
  html,
  css,
  js,
}: {
  html: string;
  css: string;
  js: string;
}) => {
  const bodyStyles = [
    "width: 1200px",
    "height: 630px",
    "margin: 0",
    "padding: 150px",
    "background-color: #4158D0",
    "background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
  ];
  const srcDoc = `<html>
<body>${html}</body>
<style>${css}</style>
<script>${js}</script>
</html> `;

  return `
  <html>
    <body style="${bodyStyles.join("; ")}">
      <iframe
        title="output"
        sandbox="allow-scripts"
        width="100%"
        height="100%"
        style="border: none; border-radius: 20px; box-shadow: rgba(0, 0, 0, 0.6) 0px 25px 50px -12px;"
        srcDoc="${srcDoc
          .replaceAll(/\n/g, "")
          .replaceAll(/"/g, "&#34;")
          .replaceAll(/'/g, "&#39;")}"
      >
      </iframe>
    </body>
  </html>
`;
};
