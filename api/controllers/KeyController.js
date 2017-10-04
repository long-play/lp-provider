/**
 * KeyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const request = require('request');

function requestEtherscan(query) {
  const apiKey = sails.config.custom.etherscan.apiKey;
  const baseUrl = `http://api.etherscan.io/api?apikey=${apiKey}`;
  const url = `${baseUrl}&${query}`;
  sails.log.info(url);
  const promise = new Promise( (resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) reject(error);
      else resolve(JSON.parse(body));
    });
  });
  return promise;
};

module.exports = {
  
  find: (req, res) => {
    const address = req.query.address;

    const query = `module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`;
    requestEtherscan(query).then( (response) => {
      //todo: if response.status != 1 || !response.result || response.result.length == 0 throw
      const txs = response.result;
      const txId = txs[0].hash;
      const query = `module=proxy&action=eth_getTransactionByHash&txhash=${txId}`;
      return requestEtherscan(query);
    }).then( (response) => {
      const tx = response.result;
      return res.ok({
        address: address,
        publicKey: tx.publicKey
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  }

};

