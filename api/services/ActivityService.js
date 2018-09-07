/**
 * ActivityService
 *
 * @description :: Server-side logic for work with Activity blockchain
 */

const BN = require('bn.js');
const Web3 = require('web3');
const web3 = new Web3(sails.config.custom.ethereum.gethUrl);
const account = web3.eth.accounts.privateKeyToAccount(sails.config.custom.providerInfo.privateKey);
const ewPlatform = new web3.eth.Contract(require('../abis/abi-platform.json'), sails.config.custom.ethereum.contracts.platform);
const ewEscrow = new web3.eth.Contract(require('../abis/abi-escrow.json'), sails.config.custom.ethereum.contracts.escrow);

sails.log.debug(`Started Activity service with address ${account.address}`);

function sendActivityEmail(will) {
  const promise = Heartbeat.createHeartbeat(will.id).then( (heartbeat) => {
    const subject = 'e-will.org activity confirmation';
    const message = `Dear customer,\nTo confirm you are not ready to release the will, please open the link ${sails.config.custom.domain}/heartbeat?token=${heartbeat.token}.`;
    return MailService.send(will.contacts.email.email, subject, message);
  }).then( () => {
  });

  return promise;
}

module.exports = {
  /**
   * `ActivityService.check`
   */
  check: () => {
    let theWills = null;

    const promise = Will.willsToCheckActivity().then( (wills) => {
      sails.log.info(wills);
      for (let will of wills) {
        sendActivityEmail(will);
      }
      theWills = wills;
    });

    return promise;
  }
};
