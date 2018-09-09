/**
 * Contact.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

function randomCode (length = 5, alphabet = '0123456789') {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return res;
};

module.exports = {

  attributes: {
    state: {
      required: true,
      type: 'string',
      isIn: ['new', 'confirmed', 'expired']
    },

    email: {
      unique: true,
      required: true,
      type: 'string'
    },

    confirmationCode: {
      type: 'string'
    },

    expiresAt: {
      required: true,
      type: 'number'
    }

  },

  createContact: (email) => {
    const contact = {
      state: 'new',
      email: email,
      confirmationCode: randomCode(),
      expiresAt: Date.now() + sails.config.custom.emailConfirmationTimeout
    };

    const promise = Contact.findOne({ email: email }).then( (existingContact) => {
      if (!existingContact) {
        return Contact.create(contact).meta({ fetch: true });
      }
      return Contact.update({ id: existingContact.id }, contact).meta({ fetch: true });
    }).then( (contacts) => {
      let result = contacts;
      if (Array.isArray(contacts) === true) {
        result = (contacts.length > 0 ? contacts[0] : null);
      }

      if (!result) {
        return Promise.reject(/* error */);
      }

      return Promise.resolve(result);
    });
    return promise;
  },

  confirmContact: (email, code) => {
    let theContact = null;
    const promise = Contact.findOne({ email: email }).then( (contact) => {
      if (!contact) {
        return Promise.reject(ErrorService.ObjectNotFound);
      } else if (contact.state !== 'new') {
        return Promise.reject(ErrorService.WrongState);
      } else if (contact.expiresAt <= Date.now()) {
        const expired = Contact.update({ id: contact.id }, { state: 'expired' });
        return expired.then( () => Promise.reject(ErrorService.Expired) );
      } else if (contact.confirmationCode !== code) {
        return Promise.reject(ErrorService.WrongConfirmationCode);
      }
      theContact = contact;
      contact.state = 'confirmed';
      return Contact.update({ id: contact.id }, contact);
    }).then( () => {
      return Promise.resolve(theContact);
    });
    return promise;
  },

  actualizeState: () =>  {
    return Promise.reject({ error: 'not implemented yet' });
  }

};

