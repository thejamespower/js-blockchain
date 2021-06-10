const routes = require('express').Router();
const broadcast = require('./broadcast');
const add = require('./add');

routes.use('/broadcast', broadcast);
routes.use('/add', add);

module.exports = routes;
