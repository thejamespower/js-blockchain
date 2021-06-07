const routes = require('express').Router();
const blockchain = require('./blockchain');
const transaction = require('./transaction');

routes.use('/blockchain', blockchain);
routes.use('/transaction', transaction);

module.exports = routes;
