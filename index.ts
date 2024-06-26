import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import { Server } from "socket.io";

import usersRoute from "./routes/user";
import filesRoute from "./routes/files";
import codeRoute from "./routes/runCode";
import examRoute from "./routes/exams";
import challengeRoute from "./routes/ui-challenges";
import roomRoute from "./routes/rooms";
import problemsRoute from "./routes/problems";
import playgroundRoute from "./routes/playground";
import submissionsRoute from "./routes/submissions";
import projectsRoute from "./routes/projects";
import allowCORS from "./middlewares/allow-cors";
import { setupSocketIO } from "./socketio";

const PORT = Number(process.env.PORT || 3333);

const app = express();

app.use(allowCORS);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

setupSocketIO(io);

app.use("/runCode", codeRoute);
app.use("/users", usersRoute);
app.use("/rooms", roomRoute);
app.use("/files", filesRoute);
app.use("/exams", examRoute);
app.use("/ui-challenges", challengeRoute);
app.use("/problems", problemsRoute);
app.use("/playground", playgroundRoute);
app.use("/submissions", submissionsRoute);

app.use("/projects", projectsRoute);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server up on http://localhost:${PORT}`);
});
