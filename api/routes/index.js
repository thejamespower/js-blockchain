const routes = require('express').Router();
const blockchain = require('./blockchain');
const transaction = require('./transaction');
const mine = require('./mine');
const node = require('./node');

routes.use('/blockchain', blockchain);
routes.use('/transaction', transaction);
routes.use('/mine', mine);
routes.use('/node', node);

module.exports = routes;
