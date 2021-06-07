const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const routes = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.use((error, req, res) => {
  console.error(`ERROR: ${error.message}`);

  if (!error.statusCode) {
    error.statusCode = 500;
  }

  return res.status(500).json({ error: error.message });
});

app.listen(8080, () => console.log('Listening on port 8080...'));
