/**
 * EthereumService
 *
 * @description :: Server-side logic for work with Ethereum blockchain
 */

const Web3 = require('web3');
const web3 = new Web3(sails.config.custom.ethereum.gethUrl);
const ewPlatform = new web3.eth.Contract(require('../abis/abi-platform.json'), sails.config.custom.ethereum.contracts.platform);
const ewEscrow = new web3.eth.Contract(require('../abis/abi-escrow.json'), sails.config.custom.ethereum.contracts.escrow);

function handleNewWills() {
}

module.exports = {
  /**
   * `EthereumService.handleNewWills`
   */
  handleNewWills: () => {
    ewPlatform.methods.name().call().then( (name) => {
      sails.log.debug('handled new wills: ' + name);
    });
  }
};
