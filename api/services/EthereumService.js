/**
 * EthereumService
 *
 * @description :: Server-side logic for work with Ethereum blockchain
 */

const BN = require('bn.js');
const Web3 = require('web3');
const web3 = new Web3(sails.config.custom.ethereum.gethUrl);
const account = web3.eth.accounts.privateKeyToAccount(sails.config.custom.providerInfo.privateKey);
const ewPlatform = new web3.eth.Contract(require('../abis/abi-platform.json'), sails.config.custom.ethereum.contracts.platform);
let oldestBlockNumber = 0;

sails.log.debug(`Started Ethereum service with address ${account.address}`);

web3.eth.getBlockNumber().then( (blockNumber) => {
  sails.log.info(`Current block number is ${blockNumber}`);
  //oldestBlockNumber = blockNumber - sails.config.custom.ethereum.historyLength;
});

function sendTx(signedTx) {
  const promise = new Promise( (resolve, reject) => {
    // send the transaction to the network
    const defer = web3.eth.sendSignedTransaction(signedTx);
    defer.once('transactionHash', (txId) => {
      sails.log.debug(`Tx created: ${txId}`);
      resolve(txId);
    });
    defer.once('receipt', (receipt) => {
      sails.log.debug(`Tx receipt received: ${ JSON.stringify(receipt) }`);
    });
    defer.once('confirmation', (count/*, receipt*/) => {
      sails.log.debug(`Tx comfirmed ${count} times`);
    });
    defer.once('error', (err) => {
      sails.log.error(`Failed to submit the will tx: ${ JSON.stringify(err) }`);
      reject(err);
    });
  });

  return promise;
}

function activateWill(willId, will) {
  const activateWill = ewPlatform.methods.activateWill(willId);
  const promise = activateWill.estimateGas({ from: sails.config.custom.providerInfo.address }).then( (gasLimit) => {
    const payload = activateWill.encodeABI();
    console.log(payload);

    const rawTx = {
      to: ewPlatform.options.address,
      data: payload,
      value: 0,
      gasLimit: gasLimit,
      chainId: sails.config.custom.ethereum.chainID
    };
    return account.signTransaction(rawTx);
  }).then( (tx) => {
    sails.log.info(`Tx for activating will ${will.id} (${willId}) signed: ${tx.rawTransaction.toString('hex')}`);
    return sendTx(tx.rawTransaction);
  }).then( (txId) => {
    sails.log.info(`Tx for activating will ${willId} sent: ${txId}`);
    return Promise.resolve(txId);
  });

  return promise;
}

function handleNewWill(creatingEvent) {
  let theWill = null;
  const willId = creatingEvent.returnValues.willId;
  const objId = (new BN(willId)).uand(new BN(0xffffffff)).toNumber();

  const promise = Will.canActivateWill(objId, creatingEvent.returnValues.owner).then( (will) => {
    let ipromise = Promise.resolve();
    theWill = will;
    if (theWill) {
      ipromise = ipromise.then( () => activateWill(willId, theWill) );
    } else {
      sails.log.info('wrong state. skipping...');
    }
    return ipromise;
  }).then( () => {
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
  },

  /**
   * `EthereumService.refreshWill`
   */
  refreshWill: (willId) => {
    const refreshWill = ewPlatform.methods.refreshWill(willId);
    const promise = refreshWill.estimateGas({ from: sails.config.custom.providerInfo.address }).then( (gasLimit) => {
      const payload = refreshWill.encodeABI();
      console.log(payload);

      const rawTx = {
        to: ewPlatform.options.address,
        data: payload,
        value: 0,
        gasLimit: gasLimit,
        chainId: sails.config.custom.ethereum.chainID
      };
      return account.signTransaction(rawTx);
    }).then( (tx) => {
      sails.log.info(`Tx for refreshing will ${will.id} (${willId}) signed: ${tx.rawTransaction.toString('hex')}`);
      return sendTx(tx.rawTransaction);
    }).then( (txId) => {
      sails.log.info(`Tx for refreshing will ${willId} sent: ${txId}`);
      return Promise.resolve(txId);
    });

    return promise;
  }

};
