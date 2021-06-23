const shajs = require('sha.js');
const uuid = require('./uuid');

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    // the other nodes in the network (excluding this node)
    this.networkNodes = [];

    (() => {
      if (process.env.NODE_URL && process.env.NODE_PORT) {
        // url of this node
        this.nodeURL = `${process.env.NODE_URL}:${process.env.NODE_PORT}`;
      } else {
        throw new Error('NODE_URL and NODE_PORT are required');
      }
    })();

    // create genesis block
    this.createNewBlock({ nonce: 0, previousBlockHash: '0', hash: '0' });
  }

  createNewBlock({ nonce, previousBlockHash, hash }) {
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      previousBlockHash,
      hash,
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction({ amount, sender, recipient }) {
    return {
      amount,
      sender,
      recipient,
      id: uuid.v1().replace(/-/g, ''),
    };
  }

  addTransactionToPending(transaction) {
    this.pendingTransactions.push(transaction);

    // return block index that transaction will be added to (next block)
    return this.getLastBlock()['index'] + 1;
  }

  hashBlock({ previousBlockHash, currentBlockData, nonce }) {
    const dataString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

    return new shajs.sha256().update(dataString).digest('hex');
  }

  proofOfWork({ previousBlockHash, currentBlockData }) {
    let nonce = 0;
    let hash = this.hashBlock({ previousBlockHash, currentBlockData, nonce });

    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock({ previousBlockHash, currentBlockData, nonce });
    }

    return nonce;
  }

  chainIsValid(blockchain) {
    return blockchain.reduce((acc, curr) => {
      // validate genesis block
      if (curr.index === 0) {
        return curr.nonce !== 0 ||
          curr.previousBlockHash !== '0' ||
          curr.hash !== '0' ||
          curr.transactions.length !== 0
          ? false
          : acc;
      }

      const previousBlock = blockchain[curr.index - 1];
      // validate hashes
      const validHashes = curr.previousBlockHash === previousBlock.hash;

      // generate a hash from the block data and check it matches the proof of work validation
      const blockHash = this.hashBlock({
        previousBlockHash: previousBlock.hash,
        currentBlockData: {
          transactions: curr.transactions,
          index: curr.index,
        },
        nonce: curr.nonce,
      });

      const validBlockHash = blockHash.substring(0, 4) === '0000';

      return !validHashes || !validBlockHash ? false : acc;
    }, true);
  }
}

module.exports = Blockchain;
