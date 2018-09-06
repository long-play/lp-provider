/**
 * EthereumService
 *
 * @description :: Server-side logic for work with Ethereum blockchain
 */

const BN = require('bn.js');
const Web3 = require('web3');
const web3 = new Web3(sails.config.custom.ethereum.gethUrl);
const ewPlatform = new web3.eth.Contract(require('../abis/abi-platform.json'), sails.config.custom.ethereum.contracts.platform);
const ewEscrow = new web3.eth.Contract(require('../abis/abi-escrow.json'), sails.config.custom.ethereum.contracts.escrow);
let oldestBlockNumber = 0;

web3.eth.getBlockNumber().then( (blockNumber) => {
  sails.log.info(`Current block number is ${blockNumber}`);
  //oldestBlockNumber = blockNumber - sails.config.custom.ethereum.historyLength;
});

function handleNewWill(creatingEvent) {
  let theWill = null;
  const willId = creatingEvent.returnValues.willId;
  const objId = (new BN(willId)).uand(new BN(0xffffffff)).toNumber();
  const activateWill = ewPlatform.methods.activateWill(creatingEvent.returnValues.willId);

  const promise = Will.canActivateWill(objId, creatingEvent.returnValues.owner).then( (will) => {
    let promise = Promise.resolve();
    theWill = will;
    if (theWill) {
      promise = promise.then( () => theWill );//activateWill.send({ from: sails.config.custom.providerInfo.privateKey });
    } else {
      sails.log.info('wrong state. skipping...');
    }
    return promise;
  }).then( (tx) => {
    sails.log.info(theWill);
    return theWill ? Will.activateWill(objId, creatingEvent.returnValues.owner) : Promise.resolve();
  });

  return promise;
}

module.exports = {
  /**
   * `EthereumService.handleNewWills`
   */
  handleNewWills: () => {
    sails.log.info(`Starts since block: ${oldestBlockNumber}`);

    ewPlatform.getPastEvents('WillCreated', { fromBlock: oldestBlockNumber }).then( (events) => {
      let ev = null;
      let promise = Promise.resolve();

      if (events.length > 0) { ev = events[0]; }
      if (ev) { promise = promise.then( () => handleNewWill(ev) ); }

      return promise.then( () => ev );
    }).then( (ev) => {
      if (ev && ev.blockNumber > oldestBlockNumber) {
        oldestBlockNumber = ev.blockNumber + 1;
      }
    }).catch( (err) => {
      sails.log.error(`Failed to get created wills: ${JSON.stringify(err)}`);
    });
  }
};
