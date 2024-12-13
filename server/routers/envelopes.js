const express = require("express");
const envelopesRouter = express.Router();

let id = 3;
envelopes = [
  {
    name: "Rent",
    budget: 300,
    id: 1,
  },
  {
    name: "Food",
    budget: 150,
    id: 2,
  }
];

envelopesRouter.param("id", (req, res, next, id) => {
  const envelopeId = Number(id);

  if (!envelopeId) {
    return res.status(400).send("Id should be number");
  }

  const envelope = envelopes.find((item) => item.id == envelopeId);
  if (!envelope) {
    return res.status(400).send("Id not found");
  }

  req.params.envelope = envelope;
  next();
});

envelopesRouter.get("/", (req, res) => {
  res.send(envelopes);
});

envelopesRouter.get("/:id", (req, res) => {
  res.send(req.params.envelope);
});

envelopesRouter.post("/", (req, res) => {
  const envelope = req.body;
  envelope.id = id;
  id++;
  envelopes.push(envelope);
  res.status(201).send(envelope);
});

envelopesRouter.post("/:id", (req, res) => {
  const moneyExtracted = Number(req.body.moneyExtracted);

  if (!moneyExtracted) {
    return res.status(400).send("Expected a number");
  }

  if (moneyExtracted > req.params.envelope.budget) {
    return res.status(400).send("Cannot overspend on budget");
  }

  req.params.envelope.budget -= moneyExtracted;
  const index = envelopes.findIndex(
    (item) => item.id == req.params.envelope.id
  );
  envelopes[index] = req.params.envelope;
  res.send(envelopes[index]);
});

envelopesRouter.delete("/:id", (req, res) => {
  const index = envelopes.findIndex(
    (item) => item.id == req.params.envelope.id
  );
  const removedEnvelope = envelopes.splice(index, 1)[0];
  res.status(204).send(removedEnvelope);
});

envelopesRouter.post("/transfer/:from/:to", (req, res) => {
  const from = Number(req.params.from);
  const to = Number(req.params.to);

  if (!from || !to) {
    return res.status(400).send("Id should be number");
  }

  if (from == to) {
    return res.status(400).send("Cannot transfer to same envelope");
  }

  const envelopeFrom = envelopes.find((item) => item.id == from);
  const envelopeTo = envelopes.find((item) => item.id == to);
  if (!envelopeFrom || !envelopeTo) {
    return res.status(400).send("Id not found");
  }

  const transferAmount = Number(req.body.transferAmount);

  if (!transferAmount) {
    return res.status(400).send("Expected a number");
  }

  if (transferAmount > envelopeFrom.budget) {
    return res.status(400).send("Cannot overspend on budget");
  }

  envelopeFrom.budget -= transferAmount;
  envelopeTo.budget += transferAmount;

  const indexFrom = envelopes.findIndex((item => item.id == envelopeFrom.id));
  const indexTo = envelopes.findIndex((item => item.id == envelopeTo.id));
  
  envelopes[indexFrom] = envelopeFrom;
  envelopes[indexTo] = envelopeTo;

  res.send("Succesfully transfered");
});

module.exports = envelopesRouter;
