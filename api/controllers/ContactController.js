/**
 * ContactController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  submit: (req, res) => {
    const email = req.body.email;

    if (ValidationService.validateEmail(email) !== true) {
      return res.serverError(ErrorService.InvalidEmailFormat);
    }

    let theContact = null;
    Contact.createContact(email).then( (contact) => {
      theContact = contact;
      const subject = 'e-will.org email confirmation';
      const message = `Use this code "${contact.confirmationCode}" for confirmation the email`;
      return MailService.send(email, subject, message);
    }).then( () => {
      return res.ok({
        email: theContact.email,
        expiresAt: theContact.expiresAt
      });
    }).catch( (error) => {
      return res.serverError(error);
    });
  },

};

