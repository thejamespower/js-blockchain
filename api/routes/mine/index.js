const routes = require('express').Router();
const { v1: uuid } = require('../../../lib/uuid');

const blockchain = require('../../../lib/run');
const request = require('request-promise-native');

const reward = 1;
const nodeAddress = uuid().replace(/-/g, '');

routes.get('/', async (req, res, next) => {
  try {
    const lastBlock = blockchain.getLastBlock();
    const previousBlockHash = lastBlock.hash;

    const currentBlockData = {
      transactions: blockchain.pendingTransactions,
      index: lastBlock.index + 1,
    };

    const nonce = blockchain.proofOfWork({
      previousBlockHash,
      currentBlockData,
    });

    const hash = blockchain.hashBlock({
      previousBlockHash,
      currentBlockData,
      nonce,
    });

    const newBlock = blockchain.createNewBlock({
      nonce,
      previousBlockHash,
      hash,
    });

    // broadcast new block to network
    await Promise.all([
      ...blockchain.networkNodes.map((url) =>
        url
          ? request({
              uri: url + '/receive-new-block',
              method: 'POST',
              body: {
                newBlock,
              },
              json: true,
            })
          : null
      ),
      // reward
      request({
        uri: blockchain.nodeURL + '/transaction/broadcast',
        method: 'POST',
        body: {
          amount: reward,
          // "00" sender infers mining reward
          sender: '00',
          recipient: nodeAddress,
        },
        json: true,
      }),
    ]);

    res.json({
      status: 'success',
      block: newBlock,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
