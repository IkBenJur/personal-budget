const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function envelopeByIdMiddleware(request, response, next, id) {
  const envelopeId = Number(id);

  if (!envelopeId) {
    return response.status(400).send("Id should be number");
  }

  pool.query(
    "SELECT * FROM envelopes WHERE id = $1",
    [envelopeId],
    (error, results) => {
      if (error) {
        console.log(error.message);
        return response.status(500).send("Something went wrong");
      }

      if (results.rowCount == 0) {
        return response.status(400).send("Id not found");
      }

      request.envelope = results.rows[0];
      next();
    }
  );
}

function allEnvelopes(request, response) {
  pool.query("SELECT * FROM envelopes", (error, results) => {
    if (error) {
      console.log(error.message);
      return response.status(500).send("Something went wrong");
    }

    response.status(200).json(results.rows);
  });
}

function envelopeById(request, reponse) {
  reponse.status(200).send(request.envelope);
}

function createEnvelope(request, response) {
  const envelope = request.body;

  if (!envelope || !envelope.name || !envelope.budget) {
    return response.status(400).send("Invalid request. Suply name and Budget");
  }
  pool.query(
    "INSERT INTO envelopes (name, budget) VALUES ($1, $2)",
    [envelope.name, envelope.budget],
    (error, results) => {
      if (error) {
        console.log(error.message);
        return response.status(500).send("Something went wrong");
      }

      response.status(202).send("Created new envelope");
    }
  );
}

function extractMoney(request, response) {
  const moneyExtracted = Number(request.body.moneyExtracted);

  if (!moneyExtracted) {
    return response.status(400).send("Expected a number");
  }

  if (moneyExtracted > request.envelope.budget) {
    return response.status(400).send("Cannot overspend on budget");
  }

  pool.query(
    "UPDATE envelopes SET budget = budget - $1 WHERE id = $2",
    [moneyExtracted, request.envelope.id],
    (error, results) => {
      if (error) {
        console.log(error.message);
        return response.status(500).send("Something went wrong");
      }

      response.status(200).send("Updated");
    }
  );
}

function deleteEnvelope(request, response) {
  pool.query(
    "DELETE FROM envelopes WHERE id = $1",
    [request.envelope.id],
    (error, results) => {
      if (error) {
        console.log(error.message);
        return response.status(500).send("Something went wrong");
      }

      response.status(204).send("Deleted envelope");
    }
  );
}

async function transferFromEnvelope(request, response) {
  const from = Number(request.params.from);
  const to = Number(request.params.to);

  if (!from || !to) {
    return response.status(400).send("Id should be number");
  }

  if (from == to) {
    return response.status(400).send("Cannot transfer to same envelope");
  }

  const resultFrom = await pool.query("SELECT * FROM envelopes WHERE id = $1", [
    from,
  ]);
  const resultTo = await pool.query("SELECT * FROM envelopes WHERE id = $1", [
    to,
  ]);

  const envelopeFrom = resultFrom.rows[0];
  const envelopeTo = resultTo.rows[0];

  if (!envelopeFrom || !envelopeTo) {
    return response.status(400).send("Id not found");
  }

  const transferAmount = Number(request.body.transferAmount);

  if (!transferAmount) {
    return response.status(400).send("Expected a number");
  }

  if (transferAmount > envelopeFrom.budget) {
    return response.status(400).send("Cannot overspend on budget");
  }

  console.log(envelopeFrom);
  await pool.query("UPDATE envelopes SET budget = budget - $1 WHERE id = $2", [
    transferAmount,
    envelopeFrom.id,
  ]);
  await pool.query("UPDATE envelopes SET budget = budget + $1 WHERE id = $2", [
    transferAmount,
    envelopeTo.id,
  ]);

  response.status(200).send("Succesfully transfered");
}

module.exports = {
  envelopeByIdMiddleware,
  allEnvelopes,
  envelopeById,
  createEnvelope,
  extractMoney,
  deleteEnvelope,
  transferFromEnvelope,
};
