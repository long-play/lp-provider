/**
 * WillController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  create: (req, res) => {
    const contacts = req.body.contacts;

    //todo: validate contacts
    sails.log.debug(contacts);

    Contact.confirmContact(contacts.email.email, contacts.email.code).then( (contact) => {
      return Will.createWill(contacts);
    }).then( (will) => {
      const msg = `${sails.config.custom.providerInfo.address}:${will.id}:${will.token}`;
      const signature = '//todo:'; //todo: using sails.config.custom.providerInfo.privateKey
      return res.ok({
        willId: will.id,
        token: will.token,
        address: sails.config.custom.providerInfo.address,
        signature: signature
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  },

  setup: (req, res) => {
    const willId = req.body.willId;
    const token = req.body.token;
    const address = req.body.address;

    //todo: validate will, token & address

    Will.setupWill(willId, address, token).then( (will) => {
      const msg = `${will.id}:${will.key}`;
      const signature = '//todo:'; //todo:
      return res.ok({
        willId: will.id,
        key: will.encryptionKey,
        signature: signature
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  }

};

