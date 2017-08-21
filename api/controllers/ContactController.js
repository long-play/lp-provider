/**
 * ContactController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
  submit: (req, res) => {
    const email = req.body.email;

    //todo: validate email format

    Contact.createContact(email).then( (contact) => {
      return res.ok({
        email: contact.email,
        expiresAt: contact.expiresAt
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  },

};

