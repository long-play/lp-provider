/**
 * EthereumService
 *
 * @description :: Server-side logic for work with Ethereum blockchain
 */

const Web3 = require('web3');
const web3 = new Web3(sails.config.custom.ethereum.geth);

function handleNewWills() {
}

module.exports = {
  /**
   * `EthereumService.handleNewWills`
   */
  handleNewWills: () => {
    sails.log.debug('handled new wills');
  }
};
