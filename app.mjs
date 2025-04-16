import express, { json } from "express";
import questionRouter from "./routers/questionrouter.mjs";
import answerRouter from "./routers/answerRouter.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/questions", questionRouter)
app.use("/answers", answerRouter)

app.get("/", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
