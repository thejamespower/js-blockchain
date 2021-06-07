const routes = require('express').Router();
const blockchain = require('../../../lib/run');

routes.get('/', (req, res) => {
  res.send(blockchain);
});

module.exports = routes;
