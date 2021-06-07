require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Blockchain', function () {
  const Blockchain = require('./blockchain');
  const dateStub = 1487076708000;

  beforeEach(() => {
    // lock time
    sinon.stub(Date, 'now').returns(dateStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates the genesis block', () => {
    const blockchain = new Blockchain();

    const genesisBlock = blockchain.chain[0];

    expect(genesisBlock.index).to.eql(0);
    expect(genesisBlock.timestamp).to.eql(dateStub);
    expect(genesisBlock.transactions).to.eql([]);
    expect(genesisBlock.nonce).to.eql(0);
    expect(genesisBlock.previousBlockHash).to.eql('0');
    expect(genesisBlock.hash).to.eql('0');
  });

  describe('createNewBlock', () => {
    it('creates a new block', () => {
      const blockchain = new Blockchain();

      const block = { nonce: 0, previousBlockHash: '0', hash: '1' };

      const newBlock = blockchain.createNewBlock(block);

      expect(newBlock.index).to.eql(1); // index is 1 (genesis block is 0)
      expect(newBlock.timestamp).to.eql(dateStub);
      expect(newBlock.transactions).to.eql([]);
      expect(newBlock.nonce).to.eql(0);
      expect(newBlock.previousBlockHash).to.eql('0');
      expect(newBlock.hash).to.eql('1');
    });
  });

  describe('getLastBlock', () => {
    it('returns the last block', () => {
      const blockchain = new Blockchain();

      // no blocks added, so returns genesis block
      expect(blockchain.getLastBlock().hash).to.eql('0');
    });
  });

  describe('adding transactions', function () {
    describe('createNewTransaction', function () {
      it('creates a new transaction', () => {
        const blockchain = new Blockchain();

        const transaction = {
          amount: 1,
          sender: 'aSender',
          recipient: 'aRecipient',
        };

        const blockIndex = blockchain.createNewTransaction(transaction);

        const pendingTransaction = blockchain.pendingTransactions[0];

        expect(pendingTransaction.amount).to.eql(1);
        expect(pendingTransaction.sender).to.eql('aSender');
        expect(pendingTransaction.recipient).to.eql('aRecipient');
        // transaction will be added to the next block (0 is genesis block)
        expect(blockIndex).to.eql(1);
      });
    });

    describe('mining a block after a transaction is added', function () {
      it('adds the transactions to the new block', () => {
        const blockchain = new Blockchain();

        const transaction = {
          amount: 1,
          sender: 'aSender',
          recipient: 'aRecipient',
        };

        blockchain.createNewTransaction(transaction);

        const block = { nonce: 0, previousBlockHash: '0', hash: '1' };

        const newBlock = blockchain.createNewBlock(block);

        const addedTransaction = newBlock.transactions[0];

        expect(addedTransaction.amount).to.eql(1);
        expect(addedTransaction.sender).to.eql('aSender');
        expect(addedTransaction.recipient).to.eql('aRecipient');
      });
    });
  });
});
