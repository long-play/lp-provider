/**
 * Will.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    token: {
      required: true,
      type: 'string'
    },

    state: {
      required: true,
      type: 'string',
      isIn: ['new', 'pending', 'active', 'applied', 'deleted', 'unpaid']
    },

    address: {
      type: 'string'
    },

    contacts: {
      required: true,
      type: 'json'
    },

    lastCheckedAt: {
      required: true,
      type: 'number'
    },

    appliedAt: {
      type: 'number'
    },

    encryptionKey: {
      required: true,
      type: 'string'
    }

  },

  createWill: (contacts) => {
    //todo: check contacts
    const will = {
      token: '//todo: guid',
      state: 'new',
      contacts: contacts,
      lastCheckedAt: Date.now(),
      encryptionKey: '0xaf1e67'
    };
    const promise = Will.create(will).meta({ fetch: true });
    return promise;
  },

  setupWill: (willId, address, token) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.token !== token) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'new') {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'pending';
      will.address = address;
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  activateWill: (willId, address) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'pending') {
        return Promise.reject(/*todo: error*/);
      } else if (will.address !== address) {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'active';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  deleteWill: (willId, address) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.address !== address) {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'deleted';
      will.encryptionKey = '';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  voidWill: (willId) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'active') {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'unpaid';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  applyWill: (willId) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'active') {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'applied';
      will.appliedAt = Date.now();
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  }

};

