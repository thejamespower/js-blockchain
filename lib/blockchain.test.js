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
    it('creates a block block', () => {
      const blockchain = new Blockchain();

      const newBlock = blockchain.createNewBlock(0, '0', '1');

      expect(newBlock.index).to.eql(1); // index is 1 (genesis block is 0)
      expect(newBlock.timestamp).to.eql(dateStub);
      expect(newBlock.transactions).to.eql([]);
      expect(newBlock.nonce).to.eql(0);
      expect(newBlock.previousBlockHash).to.eql('0');
      expect(newBlock.hash).to.eql('1');
    });
  });
});
