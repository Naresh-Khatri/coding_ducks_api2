import express, { Request, Response } from "express";
const app = express();
import morgan from "morgan";
import cors from "cors";

import usersRoute from "./routes/user";

const PORT = process.env.PORT || 3333;

app.use((req: Request, res: Response, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, X-Auth-Token"
    );
    next();
}); 
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

// app.use("/", mainRoute);
app.use("/users", usersRoute);
// app.use("/problems", problemsRoute);
// app.use("/results", resultsRoute);


app.listen(PORT, () => {
    console.log(`Server up on http://localhost:${PORT}`);
});
