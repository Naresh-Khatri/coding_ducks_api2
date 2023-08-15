export const pointsToLeague = (points: number) => {
  if (points < 10) return { id: "noob", label: "Noob" };
  else if (points < 50) return { id: "beginner", label: "Beginner" };
  else if (points < 100) return { id: "intermediate", label: "Intermediate" };
  else if (points < 200) return { id: "advance", label: "Advance" };
  else if (points < 300) return { id: "expert", label: "Expert" };
  else if (points < 450) return { id: "master", label: "Master" };
  else return { id: "grandmaster", label: "Grand Master" };
};
