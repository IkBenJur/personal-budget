const express = require("express");
const envelopesRouter = require("./routers/envelopes");
const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.send("Hello, World!");
});

apiRouter.use("/envelopes", envelopesRouter);

module.exports = apiRouter;
