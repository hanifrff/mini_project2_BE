const express = require("express");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
const expenseRouter = require("./router/expense");
const { logReqMiddleware } = require("./middleware/log");

dayjs.extend(isBetween);
const app = express();
const PORT = 8000;
app.use(express.json());
app.use(logReqMiddleware);
app.get("/", (req, res) => {
  res.send("welcome to my REST API");
});

app.use("/expense", expenseRouter);

app.listen(PORT, () => {
  console.log(`express running on port :${PORT}`);
});
