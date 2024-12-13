const express = require("express");
const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
    res.send("Hello, World!")
})

module.exports = apiRouter;
