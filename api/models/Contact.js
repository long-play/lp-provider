/**
 * Contact.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

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
      confirmationCode: '0xc0de',
      expiresAt: Date.now() + sails.config.custom.emailConfirmationTimeout
    };
    const promise = Contact.create(contact).meta({ fetch: true });
    return promise;
  },

  confirmContact: (email, code) => {
    let theContact = null;
    const promise = Contact.findOne({ email: email }).then( (contact) => {
      if (!contact) {
        return Promise.reject(/*todo: error*/);
      } else if (contact.state !== 'new') {
        return Promise.reject(/*todo: error*/);
      } else if (contact.expiresAt <= Date.now()) {
        const expired = Contact.update({ id: contact.id }, { state: 'expired' });
        return expired.then( () => Promise.reject(/*todo: error*/) );
      } else if (contact.confirmationCode !== code) {
        return Promise.reject(/*todo: error*/);
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

