const routes = require('express').Router();
const blockchain = require('../../../lib/run');
const { BadRequest } = require('../../middleware/errors');

routes.post('/', (req, res, next) => {
  try {
    const {
      body: { amount, sender, recipient },
    } = req;

    if (!amount) {
      throw new BadRequest('Transaction amount required');
    }

    if (!sender) {
      throw new BadRequest('Transaction sender required');
    }

    if (!recipient) {
      throw new BadRequest('Transaction recipient required');
    }

    res.json({
      blockIndex: blockchain.createNewTransaction({
        amount,
        sender,
        recipient,
      }),
    });
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
