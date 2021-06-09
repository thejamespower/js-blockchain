const routes = require('express').Router();

const blockchain = require('../../../../lib/run');

routes.post('/', async (req, res, next) => {
  const { newNodeURL } = req.body;
  const { networkNodes, nodeURL } = blockchain;

  // if new node is not already registered
  // if new node is not current node
  if (networkNodes.indexOf(newNodeURL) === -1 && nodeURL !== newNodeURL) {
    // register the new nodeURL with this node
    networkNodes.push(newNodeURL);

    console.log(`INFO: Node registered: ${newNodeURL}`);
  }

  res.json({
    status: 'success',
    newNodeURL,
  });
});

module.exports = routes;
