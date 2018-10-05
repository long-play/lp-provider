/**
 * WillController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const EthUtil = require('ethereumjs-util');

module.exports = {

  create: (req, res) => {
    const contacts = req.body.contacts;

    Contact.confirmContact(contacts.email.email, contacts.email.code).then( (/*contact*/) => {
      return Will.createWill(contacts);
    }).then( (will) => {
      const msg = Buffer.concat([EthUtil.toBuffer(sails.config.custom.providerInfo.address), EthUtil.toBuffer('' + will.id), EthUtil.toBuffer(will.token)]);
      const hash = EthUtil.keccak256(msg);
      const signature = EthUtil.ecsign(hash, EthUtil.toBuffer(sails.config.custom.providerInfo.privateKey));

      return res.ok({
        willId: will.id,
        token: will.token,
        address: sails.config.custom.providerInfo.address,
        signature: {
          v: signature.v,
          r: '0x' + signature.r.toString('hex'),
          s: '0x' + signature.s.toString('hex'),
        }
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  },

  setup: (req, res) => {
    const willId = req.body.willId;
    const token = req.body.token;
    const address = req.body.address;
    const userPublicKey = req.body.userPublicKey;
    const userAddress = '0x' + EthUtil.pubToAddress(EthUtil.toBuffer('0x' + userPublicKey.slice(4))).toString('hex');

    //todo: check userAddress.toLowerCase() == address.toLowerCase()
    //todo: add checking of signature

    Will.setupWill(willId, address, token, userPublicKey).then( (will) => {
      const msg = Buffer.concat([EthUtil.toBuffer(will.id), EthUtil.toBuffer(will.encryptionKey)]);
      const hash = EthUtil.keccak256(msg);
      const signature = EthUtil.ecsign(hash, EthUtil.toBuffer(sails.config.custom.providerInfo.privateKey));
      return res.ok({
        willId: will.id,
        key: will.encryptionKey,
        signature: {
          v: signature.v,
          r: '0x' + signature.r.toString('hex'),
          s: '0x' + signature.s.toString('hex'),
        }
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  }

};

