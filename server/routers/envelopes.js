const express = require("express");
const {
  allEnvelopes,
  envelopeByIdMiddleware,
  extractMoney,
  envelopeById,
  createEnvelope,
  deleteEnvelope,
  transferFromEnvelope,
} = require("../../db/queries");
const envelopesRouter = express.Router();

envelopesRouter.param("id", envelopeByIdMiddleware);
envelopesRouter.get("/", allEnvelopes);
envelopesRouter.get("/:id", envelopeById);
envelopesRouter.post("/", createEnvelope);
envelopesRouter.post("/:id", extractMoney);
envelopesRouter.delete("/:id", deleteEnvelope);
envelopesRouter.post("/transfer/:from/:to", transferFromEnvelope);

module.exports = envelopesRouter;
