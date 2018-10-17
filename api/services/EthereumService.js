/**
 * EthereumService
 *
 * @description :: Server-side logic for work with Ethereum blockchain
 */

const BN = require('bn.js');
const Web3 = require('web3');
const web3 = new Web3(sails.config.custom.ethereum.gethUrl);

const createHash = require('create-hash');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

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
    sails.log.debug(payload);

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

function rejectWill(willId, will) {
  const rejectWill = ewPlatform.methods.rejectWill(willId);
  const promise = rejectWill.estimateGas({ from: sails.config.custom.providerInfo.address }).then( (gasLimit) => {
    const payload = rejectWill.encodeABI();
    sails.log.debug(payload);

    const rawTx = {
      to: ewPlatform.options.address,
      data: payload,
      value: 0,
      gasLimit: gasLimit,
      chainId: sails.config.custom.ethereum.chainID
    };
    return account.signTransaction(rawTx);
  }).then( (tx) => {
    sails.log.info(`Tx for rejecting will ${will.id} (${willId}) signed: ${tx.rawTransaction.toString('hex')}`);
    return sendTx(tx.rawTransaction);
  }).then( (txId) => {
    sails.log.info(`Tx for rejecting will ${willId} sent: ${txId}`);
    return Promise.resolve(txId);
  });

  return promise;
}

function checkWillStatus(will) {
  const willId = Will.willId(will);
  const promise = ewPlatform.methods.wills(willId).call().then( (ethWill) => {
    let ipromise = Promise.resolve();
    const remains = ethWill.validTill * 1000 - Date.now();
    sails.log.info(`Remain ${remains / 1000} seconds until subscription for ${willId} ends.`);

    if (theWill.state != 2 || remains < 0) {
      sails.log.info(`Expired will: ${JSON.stringify(theWill)}.`);
      ipromise = Will.voidWill(will.id).then( () => {
        const subject = 'e-will.org subscription has expired';
        const message = `Dear customer,\nYou subscription for will '${ethWill.title}' has expired. You have to create a new one if you want to save and transfer your digital assets in case of circumstances`;
        return MailService.send(will.contacts.email.email, subject, message);
      }).then( () => {
        return rejectWill(willId, will);
      });
    } else if (remains <= sails.config.custom.activityConfirmationTimeout) {
      const subject = 'e-will.org subscription is ending';
      const message = `Dear customer,\nYou subscription for will '${ethWill.title}' is ending. Please prolong it or it will be removed and won't be passed to the beneficiary in case of circumstances`;
      ipromise = MailService.send(will.contacts.email.email, subject, message);
    }

    return ipromise;
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

    //todo: add filtering on params: provider address
    ewPlatform.getPastEvents('WillCreated', { fromBlock: oldestBlockNumber }).then( (events) => {
      let ev = null;
      let promise = Promise.resolve();

      sails.log.debug(`Events to process: ${events.length}`);
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
  refreshWill: (will) => {
    const willId = Will.willId(will);
    const refreshWill = ewPlatform.methods.refreshWill(willId);
    const promise = refreshWill.estimateGas({ from: sails.config.custom.providerInfo.address }).then( (gasLimit) => {
      const payload = refreshWill.encodeABI();
      sails.log.debug(payload);

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
    }).catch( (err) => {
      sails.log.error(`Failed to refresh will ${willId}: ${JSON.stringify(err)}`);
    });

    return promise;
  },

  /**
   * `EthereumService.checkStatus`
   */
  checkStatus: () => {
    const promise = Will.activeWills().then( (wills) => {
      const promises = [];
      for (let will of wills) {
        //promises.push(checkWillStatus(will));
      }
      return Promise.all(promises);
    }).catch( (err) => {
      sails.log.error(`Failed to check status of wills: ${JSON.stringify(err)}`);
    });

    return promise;
  },

  /**
   * `EthereumService.releaseWill`
   */
  releaseWill: (will) => {
    const willId = Will.willId(will);
    const pubKey = ec.keyFromPublic(will.userPublicKey.slice(2), 'hex');
    const privKey = ec.keyFromPrivate(sails.config.custom.providerInfo.privateKey.slice(2), 'hex');
    const Px = privKey.derive(pubKey.pub).toString('hex');
    const decryptionKey = '0x' + createHash('sha256').update(Px).digest().toString('hex');
    const releaseWill = ewPlatform.methods.applyWill(willId, decryptionKey);

    const promise = releaseWill.estimateGas({ from: sails.config.custom.providerInfo.address }).then( (gasLimit) => {
      const payload = releaseWill.encodeABI();
      sails.log.debug(payload);

      const rawTx = {
        to: ewPlatform.options.address,
        data: payload,
        value: 0,
        gasLimit: gasLimit,
        chainId: sails.config.custom.ethereum.chainID
      };
      return account.signTransaction(rawTx);
    }).then( (tx) => {
      sails.log.info(`Tx for releasing will ${will.id} (${willId}) signed: ${tx.rawTransaction.toString('hex')}`);
      return sendTx(tx.rawTransaction);
    }).then( (txId) => {
      sails.log.info(`Tx for releasing will ${willId} sent: ${txId}`);
      return Promise.resolve(txId);
    }).catch( (err) => {
      sails.log.error(`Failed to release will ${willId}: ${JSON.stringify(err)}`);
    });

    return promise;
  },

  /**
   * `EthereumService.sendEthers`
   */
  sendEthers: (to, value) => {
    const rawTx = {
      to: to,
      value: value,
      gasLimit: 21000,
      chainId: sails.config.custom.ethereum.chainID
    };
    const promise = account.signTransaction(rawTx).then( (tx) => {
      sails.log.info(`Tx for sending ethers signed: ${tx.rawTransaction.toString('hex')}`);
      return sendTx(tx.rawTransaction);
    }).then( (txId) => {
      sails.log.info(`Tx for sending ethers sent: ${txId}`);
      return Promise.resolve(txId);
    });

    return promise;
  }

};
