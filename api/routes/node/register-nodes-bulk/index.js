const routes = require('express').Router();

const blockchain = require('../../../../lib/run');

routes.post('/', async (req, res, next) => {
  const { networkNodes: nodesToRegister } = req.body;
  const { networkNodes, nodeURL } = blockchain;

  nodesToRegister.forEach((url) => {
    // if new node is not already registered
    // if new node is not current node
    if (networkNodes.indexOf(url) === -1 && nodeURL !== url) {
      networkNodes.push(url);
    }
  });

  res.json({
    status: 'success',
    networkNodes,
  });
});

module.exports = routes;
