const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const routes = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.listen(8080, () => console.log('Listening on port 8080...'));
