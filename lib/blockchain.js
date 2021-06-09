const shajs = require('sha.js');

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];

    (() => {
      if (process.env.NODE_URL) {
        this.nodeURL = process.env.NODE_URL;
      } else {
        throw new Error('NODE_URL is not defined');
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
    this.pendingTransactions.push({
      amount,
      sender,
      recipient,
    });

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
}

module.exports = Blockchain;
