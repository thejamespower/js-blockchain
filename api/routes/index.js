const routes = require('express').Router();
const blockchain = require('./blockchain');

routes.use('/blockchain', blockchain);

module.exports = routes;
