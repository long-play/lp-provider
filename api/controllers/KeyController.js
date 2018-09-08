/**
 * KeyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const request = require('request');
const eu = require('ethereumjs-util');
const RLP = require('eth-lib/lib/rlp');
const Bytes = require('eth-lib/lib/bytes');

function requestEtherscan(query) {
  const apiKey = sails.config.custom.etherscan.apiKey;
  const baseUrl = `http://api.etherscan.io/api?apikey=${apiKey}`;
  const url = `${baseUrl}&${query}`;
  sails.log.info(url);

  const promise = new Promise( (resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) { reject(error); }
      else { resolve(JSON.parse(body)); }
    });
  });
  return promise;
};

module.exports = {

  find: (req, res) => {
    const address = req.query.address.toLowerCase();

    const query = `module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc`;
    requestEtherscan(query).then( (response) => {
      if (response.status !== '1' || !response.result || response.result.length === 0) {
        return Promise.reject(ErrorService.FailedEtherscanRequest);
      }

      const txs = response.result;
      const outTx = txs.find( tx => tx.from.toLowerCase() === address );
      if (!outTx) { return Promise.reject(ErrorService.KeyNotFound); }
      const txId = outTx.hash;
      const query = `module=proxy&action=eth_getTransactionByHash&txhash=${txId}`;
      return requestEtherscan(query);
    }).then( (response) => {
      const tx = response.result;
      const rlpEncoded = RLP.encode([
        Bytes.fromNat(tx.nonce),
        Bytes.fromNat(tx.gasPrice),
        Bytes.fromNat(tx.gas),
        tx.to ? tx.to.toLowerCase() : '0x',
        Bytes.fromNat(tx.value),
        tx.input,
        Bytes.fromNat(tx.chainId || '0x1'),
        '0x',
        '0x'
      ]);

      const signatureV = (rawV) => {
        let v = rawV;
        if (rawV > 35) { v = rawV - 10; }
        return v;
      };

      const rawTxHash = eu.keccak256(rlpEncoded);
      const euPubKey = eu.ecrecover(rawTxHash, signatureV(tx.v), tx.r, tx.s);
      const addr = '0x' + eu.pubToAddress(euPubKey).toString('hex');

      if (addr !== address) {
        return Promise.reject(ErrorService.AddressesMismatch);
      }

      return res.ok({
        address: addr,
        publicKey: '0x04' + euPubKey.toString('hex')
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  }

};

