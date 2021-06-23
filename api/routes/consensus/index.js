const routes = require('express').Router();

const blockchain = require('../../../lib/run');
const request = require('request-promise-native');

routes.get('/', async (req, res, next) => {
  try {
    const blockchains = await Promise.all(
      blockchain.networkNodes.map((url) =>
        url
          ? request({
              uri: url + '/blockchain',
              method: 'GET',
              json: true,
            })
          : null
      )
    );

    let maxChainLength = blockchain.chain.length;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(({ chain, pendingTransactions }) => {
      if (chain.length > maxChainLength) {
        maxChainLength = chain.length;
        newLongestChain = chain;
        newPendingTransactions = pendingTransactions;
      }
    });

    if (
      // if no changes need to be made
      !newLongestChain ||
      // there's a new update, but the update is not valid
      (newLongestChain && !blockchain.chainIsValid(newLongestChain))
    ) {
      res.json({
        status: 'success',
        message: 'Current chain has not been replaced.',
        chain: blockchain.chain,
      });
    }

    // this node is out of date
    else if (newLongestChain && blockchain.chainIsValid(newLongestChain)) {
      blockchain.chain = newLongestChain;
      blockchain.pendingTransactions = newPendingTransactions;

      res.json({
        status: 'success',
        message: 'Current chain has been replaced.',
        chain: blockchain.chain,
      });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
