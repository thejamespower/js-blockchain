require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');

process.env.NODE_URL = 'http://nodeAddress.com';
process.env.NODE_PORT = '8080';

describe('Blockchain', function () {
  const uuid = require('./uuid');
  const Blockchain = require('./blockchain');

  const dateStub = 1487076708000;
  const oldEnv = process.env;

  beforeEach(() => {
    // lock time
    sinon.stub(Date, 'now').returns(dateStub);
  });

  afterEach(() => {
    process.env = oldEnv;
    sinon.restore();
  });

  it('throws if process.env.NODE_URL not defined', () => {
    delete process.env.NODE_URL;

    expect(() => new Blockchain()).to.throw(
      'NODE_URL and NODE_PORT are required'
    );

    process.env.NODE_URL = 'http://nodeAddress.com';
  });

  it('throws if process.env.NODE_PORT not defined', () => {
    delete process.env.NODE_PORT;

    expect(() => new Blockchain()).to.throw(
      'NODE_URL and NODE_PORT are required'
    );

    process.env.NODE_PORT = '8080';
  });

  it('creates the genesis block', () => {
    console.log(process.env);
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
    const uuidStub = '1234';

    beforeEach(() => {
      sinon.stub(uuid, 'v1').returns(uuidStub);
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('createNewTransaction', function () {
      it('creates a new transaction', () => {
        const blockchain = new Blockchain();

        const transaction = blockchain.createNewTransaction({
          amount: 1,
          sender: 'aSender',
          recipient: 'aRecipient',
        });

        expect(transaction.amount).to.eql(1);
        expect(transaction.sender).to.eql('aSender');
        expect(transaction.recipient).to.eql('aRecipient');
        expect(transaction.id).to.eql(uuidStub);
      });
    });

    describe('addTransactionToPending', () => {
      const blockchain = new Blockchain();

      const transaction = {
        amount: 1,
        sender: 'aSender',
        recipient: 'aRecipient',
        id: uuidStub,
      };

      const blockIndex = blockchain.addTransactionToPending(transaction);

      // transaction will be added to the next block (0 is genesis block)
      expect(blockIndex).to.eql(1);
    });

    describe('mining a block after a transaction is added', function () {
      it('adds the transactions to the new block', () => {
        const blockchain = new Blockchain();

        const transaction = blockchain.createNewTransaction({
          amount: 1,
          sender: 'aSender',
          recipient: 'aRecipient',
        });

        blockchain.addTransactionToPending(transaction);

        const block = { nonce: 0, previousBlockHash: '0', hash: '1' };

        const newBlock = blockchain.createNewBlock(block);

        const addedTransaction = newBlock.transactions[0];

        expect(addedTransaction.amount).to.eql(1);
        expect(addedTransaction.sender).to.eql('aSender');
        expect(addedTransaction.recipient).to.eql('aRecipient');
      });
    });
  });

  describe('hashBlock', function () {
    it('hashes a block', () => {
      const blockchain = new Blockchain();

      const blockData = {
        previousBlockHash: '0',
        currentBlockData: [
          {
            amount: 1,
            sender: 'aSender',
            recipient: 'aRecipient',
          },
        ],
        nonce: 1,
      };

      const hash = blockchain.hashBlock(blockData);

      expect(hash).to.eql(
        'ca8af5ea3aa0001d1e5aad077b7396c10fd2326cad49977de9a83ab3528a755d'
      );
    });
  });

  describe('proofOfWork', function () {
    it('returns the correct nonce', () => {
      const blockchain = new Blockchain();

      const previousBlockHash = '0';
      const currentBlockData = [
        {
          amount: 1,
          sender: 'aSender',
          recipient: 'aRecipient',
        },
      ];

      const nonce = blockchain.proofOfWork({
        previousBlockHash,
        currentBlockData,
      });

      expect(nonce).to.eql(138976);
    });
  });
});
