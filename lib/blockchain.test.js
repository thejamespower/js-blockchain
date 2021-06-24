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

  describe('chainIsValid', function () {
    it('it returns true for valid blockchain', () => {
      const blockchain = new Blockchain();

      const chain = [
        {
          index: 0,
          timestamp: 1624450370795,
          transactions: [],
          nonce: 0,
          previousBlockHash: '0',
          hash: '0',
        },
        {
          index: 1,
          timestamp: 1624450463361,
          transactions: [
            {
              amount: 1,
              sender: 'James',
              recipient: 'Ems',
              id: '8a8aff30d41c11ebbf1ac55734c892e7',
            },
          ],
          nonce: 9937,
          previousBlockHash: '0',
          hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
        },
      ];

      expect(blockchain.chainIsValid(chain)).to.eql(true);
    });
    it('it returns false for invalid hashes', () => {
      const blockchain = new Blockchain();

      const chain = [
        {
          index: 0,
          timestamp: 1624448392197,
          transactions: [],
          nonce: 0,
          previousBlockHash: '0',
          hash: '0',
        },
        {
          index: 1,
          timestamp: 1624448442784,
          transactions: [
            {
              amount: 1,
              sender: 'James',
              recipient: 'Ems',
              id: 'd4e0a300d41711eb9386e74945d5bef8',
            },
          ],
          nonce: 10585,
          previousBlockHash:
            '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
          hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
        },
      ];

      expect(blockchain.chainIsValid(chain)).to.eql(false);
    });

    describe('validating genesis block', function () {
      it('it returns false for invalid none', () => {
        const blockchain = new Blockchain();

        const chain = [
          {
            index: 0,
            timestamp: 1624448392197,
            transactions: [],
            nonce: 100,
            previousBlockHash: '0',
            hash: '0',
          },
          {
            index: 1,
            timestamp: 1624448442784,
            transactions: [
              {
                amount: 1,
                sender: 'James',
                recipient: 'Ems',
                id: 'd4e0a300d41711eb9386e74945d5bef8',
              },
            ],
            nonce: 10585,
            previousBlockHash: '0',
            hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
          },
        ];

        expect(blockchain.chainIsValid(chain)).to.eql(false);
      });

      it('it returns false for invalid previousBlockHash', () => {
        const blockchain = new Blockchain();

        const chain = [
          {
            index: 0,
            timestamp: 1624448392197,
            transactions: [],
            nonce: 0,
            previousBlockHash:
              '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
            hash: '0',
          },
          {
            index: 1,
            timestamp: 1624448442784,
            transactions: [
              {
                amount: 1,
                sender: 'James',
                recipient: 'Ems',
                id: 'd4e0a300d41711eb9386e74945d5bef8',
              },
            ],
            nonce: 10585,
            previousBlockHash: '0',
            hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
          },
        ];

        expect(blockchain.chainIsValid(chain)).to.eql(false);
      });

      it('it returns false for invalid hash', () => {
        const blockchain = new Blockchain();

        const chain = [
          {
            index: 0,
            timestamp: 1624448392197,
            transactions: [],
            nonce: 0,
            previousBlockHash: '0',
            hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
          },
          {
            index: 1,
            timestamp: 1624448442784,
            transactions: [
              {
                amount: 1,
                sender: 'James',
                recipient: 'Ems',
                id: 'd4e0a300d41711eb9386e74945d5bef8',
              },
            ],
            nonce: 10585,
            previousBlockHash: '0',
            hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
          },
        ];

        expect(blockchain.chainIsValid(chain)).to.eql(false);
      });

      it('it returns false for invalid transactions', () => {
        const blockchain = new Blockchain();

        const chain = [
          {
            index: 0,
            timestamp: 1624448392197,
            transactions: [
              {
                amount: 1,
                sender: 'James',
                recipient: 'Ems',
                id: 'd4e0a300d41711eb9386e74945d5bef8',
              },
            ],
            nonce: 0,
            previousBlockHash: '0',
            hash: '0',
          },
          {
            index: 1,
            timestamp: 1624448442784,
            transactions: [
              {
                amount: 1,
                sender: 'James',
                recipient: 'Ems',
                id: 'd4e0a300d41711eb9386e74945d5bef8',
              },
            ],
            nonce: 10585,
            previousBlockHash: '0',
            hash: '0000568eefa01096e46a537848e7be746e8b94c1e64e9d40810473141b48ba44',
          },
        ];

        expect(blockchain.chainIsValid(chain)).to.eql(false);
      });
    });
  });
});
