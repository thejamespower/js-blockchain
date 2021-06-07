class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];

    // create genesis block
    this.createNewBlock(0, '0', '0');
  }

  createNewBlock(nonce, previousBlockHash, hash) {
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
}

module.exports = Blockchain;
