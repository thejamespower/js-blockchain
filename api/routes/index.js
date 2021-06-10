const routes = require('express').Router();
const blockchain = require('./blockchain');
const transaction = require('./transaction');
const mine = require('./mine');
const node = require('./node');
const receiveNewBlock = require('./receive-new-block');

routes.use('/blockchain', blockchain);
routes.use('/transaction', transaction);
routes.use('/mine', mine);
routes.use('/node', node);
routes.use('/receive-new-block', receiveNewBlock);

module.exports = routes;
