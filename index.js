const express = require("express");
const db = require("./models");
const router = require("./router");

const PORT = 8000;
const app = express();

app.use(express.json());

// serving static files
app.use("/static", express.static("Public"));

app.use("/api/auth", router.auth);
app.use("/api/profile", router.profile);
app.use("/api/blog", router.blog);
app.use("/api", router.like);

db.sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app start on localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("failed to connect DB");
    console.error(error);
  });
