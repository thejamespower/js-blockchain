const routes = require('express').Router();
const blockchain = require('./blockchain');
const transaction = require('./transaction');
const mine = require('./mine');

routes.use('/blockchain', blockchain);
routes.use('/transaction', transaction);
routes.use('/mine', mine);

module.exports = routes;
