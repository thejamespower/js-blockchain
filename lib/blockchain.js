class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];

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
}

module.exports = Blockchain;
