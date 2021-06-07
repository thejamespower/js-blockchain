const routes = require('express').Router();
const blockchain = require('../../../lib/run');

routes.post('/', (req, res, next) => {
  const {
    body: { amount, sender, recipient },
  } = req;

  if (!amount) {
    let error = new Error('Transaction amount required');
    error.statusCode = 400;
    return next(error);
  }

  if (!sender) {
    let error = new Error('Transaction sender required');
    error.statusCode = 400;
    return next(error);
  }

  if (!recipient) {
    let error = new Error('Transaction recipient required');
    error.statusCode = 400;
    return next(error);
  }

  res.json({
    blockIndex: blockchain.createNewTransaction({ amount, sender, recipient }),
  });
});

module.exports = routes;
