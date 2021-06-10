const routes = require('express').Router();
const { v1: uuid } = require('../../../lib/uuid');

const blockchain = require('../../../lib/run');

const reward = 1;
const nodeAddress = uuid().replace(/-/g, '');

routes.get('/', (req, res) => {
  const lastBlock = blockchain.getLastBlock();
  const previousBlockHash = lastBlock.hash;

  const currentBlockData = {
    transactions: blockchain.pendingTransactions,
    index: lastBlock.index + 1,
  };

  const nonce = blockchain.proofOfWork({ previousBlockHash, currentBlockData });

  const hash = blockchain.hashBlock({
    previousBlockHash,
    currentBlockData,
    nonce,
  });

  // reward
  // ("00" sender infers mining reward)
  blockchain.createNewTransaction({
    amount: reward,
    sender: '00',
    recipient: nodeAddress,
  });

  const newBlock = blockchain.createNewBlock({
    nonce,
    previousBlockHash,
    hash,
  });

  res.json({
    block: newBlock,
  });
});

module.exports = routes;
