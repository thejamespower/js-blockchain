const routes = require('express').Router();

const register = require('./register');
const registerAndBroadcast = require('./register-and-broadcast');
const registerNodesBulk = require('./register-nodes-bulk');

routes.use('/register', register);
routes.use('/register-and-broadcast', registerAndBroadcast);
routes.use('/register-nodes-bulk', registerNodesBulk);

module.exports = routes;
