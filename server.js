const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());

const apiRouter = require('./server/api');
app.use('/api', apiRouter);

app.listen(PORT, function () {
  console.log(`Listening on PORT: ${PORT}`)
})