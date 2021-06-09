const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const routes = require('./routes');
const handleErrors = require('./middleware/errorHandler');

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.use(handleErrors);

app.listen(PORT, () => {
  if (!process.env.PORT) {
    console.log('No port specified, default to 8080');
  }
  console.log(`Node running on port: ${PORT}`);
});
