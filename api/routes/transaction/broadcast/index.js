const routes = require('express').Router();
const request = require('request-promise-native');

const blockchain = require('../../../../lib/run');
const { BadRequest } = require('../../../middleware/errors');

routes.post('/', async (req, res, next) => {
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

    // create the transaction
    const transaction = blockchain.createNewTransaction({
      amount,
      sender,
      recipient,
    });
    // add to pending
    const blockIndex = blockchain.addTransactionToPending(transaction);
    // broadcast to network
    await Promise.all(
      blockchain.networkNodes.map((url) =>
        url
          ? request({
              uri: url + '/transaction/add',
              method: 'POST',
              body: { ...transaction },
              json: true,
            })
          : null
      )
    );

    res.json({
      status: 'success',
      blockIndex,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
