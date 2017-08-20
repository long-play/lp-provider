/**
 * WillController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  create: (req, res) => {
    const contacts = JSON.parse(req.body.contacts);

    //todo: validate contacts
    sails.log.debug(contacts);

    Will.createWill(contacts).then( (will) => {
    sails.log.debug(will);
      const msg = `${sails.config.custom.providerAddress}:${will.id}:${will.token}`;
      const signature = '//todo:'; //todo: using sails.config.custom.providerPrivateKey
      return res.ok({
        will: will.id,
        token: will.token,
        address: sails.config.custom.providerAddress,
        signature: signature
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  },

  setup: (req, res) => {
    const will = req.body.will;
    const token = req.body.token;
    const address = req.body.address;

    //todo: validate will, token & address

    Will.setupWill(will, address, token).then( (will) => {
      const msg = `${will.id}:${will.key}`;
      const signature = '//todo:'; //todo:
      return res.ok({
        will: will.id,
        key: will.encryptionKey,
        signature: signature
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  }

};

