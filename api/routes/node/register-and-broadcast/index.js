const routes = require('express').Router();
const request = require('request-promise-native');

const blockchain = require('../../../../lib/run');
const { BadRequest } = require('../../../middleware/errors');

routes.post('/', async (req, res, next) => {
  const { newNodeURL } = req.body;
  const { networkNodes } = blockchain;

  try {
    if (!newNodeURL) {
      throw new BadRequest('newNodeURL amount required');
    }

    // if new node is not already registered
    if (networkNodes.indexOf(newNodeURL) === -1) {
      // register the new nodeURL with this node
      networkNodes.push(newNodeURL);

      console.log(`INFO: Node registered: ${newNodeURL}`);

      // broadcast new nodeURL to other nodes
      await Promise.all(
        networkNodes.map((url) =>
          url
            ? request({
                uri: url + '/node/register',
                method: 'POST',
                body: {
                  newNodeURL,
                },
                json: true,
              })
            : null
        )
      );

      // register other nodes (including this node) with the new node
      await request({
        uri: newNodeURL + '/node/register-nodes-bulk',
        method: 'POST',
        body: {
          networkNodes: [...blockchain.networkNodes, blockchain.nodeURL],
        },
        json: true,
      });

      res.json({
        status: 'success',
        newNodeURL,
      });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = routes;
