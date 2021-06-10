const routes = require('express').Router();

const blockchain = require('../../../lib/run');
const { BadRequest } = require('../../middleware/errors');

routes.post('/', async (req, res, next) => {
  try {
    const { newBlock } = req.body;

    if (!newBlock) {
      throw new BadRequest('newBlock required');
    }

    const lastBlock = blockchain.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock.index + 1 === newBlock.index;

    if (!correctHash || !correctIndex) {
      throw new BadRequest('Block rejected');
    }

    blockchain.chain.push(newBlock);
    blockchain.pendingTransactions = [];

    res.json({
      status: 'success',
    });
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
