/**
 * Will.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
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
      state: 'new',
      contacts: contacts,
      lastCheckedAt: Date.now(),
      encryptionKey: '0xaf1e67'
    };
    const promise = Will.create(will);
    return promise;
  },

  setupWill: (willId, address) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'new') {
        return Promise.reject(/*todo: error*/);
      }
      will.state = 'pending';
      will.address = address;
      return will.save();
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
      will.state = 'active';
      return will.save();
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
      will.state = 'deleted';
      will.encryptionKey = '';
      return will.save();
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
      will.state = 'unpaid';
      return will.save();
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
      will.state = 'applied';
      will.appliedAt = Date.now();
      return will.save();
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  }

};

