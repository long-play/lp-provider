/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
*/

module.exports.custom = {

  /**************************************************************************
  *                                                                          *
  * Default settings for custom configuration used in your app.              *
  * (these may also be overridden in config/env/production.js)               *
  *                                                                          *
  ***************************************************************************/
  domain: 'http://localhost:1337',

  aws: {
    accessKeyId: 'AKIAJDJP52PAV47HNQXQ',
    secretAccessKey: '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',
    region: 'us-east-1'
  },

  mailgun: {
    sender: 'E-will TEST Service <no-reply@e-will.tech>',
    apiUser: 'api',
    apiKey: 'key-26f702ef3a1b7ed388f36d03ebba0022',
    apiURL: 'https://api.mailgun.net/v3/mail.e-will.tech'
  },

  etherscan: {
    apiKey: 'Z8B4AWI1AXU2JYD6P9HD7I3G9HZPWQPGKH',
  },

  providerInfo: {
    email: 'vps2018@valeyev.ru',

    masterAddress: '0x35Ebc51e8DfCb439082514471eB9Cd7C66D2e86E',
    address: '0xd79a8fdb771ea12359270ad7020bccb328c9f5f7',
    publicKey: '0x041e0973d451857c3d789e50288d91bd294dd4bdc9ef78cf97fac5e12ef4b6bf1bad35518472835ddc0bb2959555a07e079fe805587c8dfe7bae7f03e6852f1718',
    privateKey: '0xe8d1f6cb90fef5fc9696cc77858b42d4e99b0959246d86f4584b49f5af0fe3f9'
  },

  ethereum: {
    historyLength: 1024, // blocks, ~1.5 hours
    contracts: {
      platform: '0xd08e8ff56af69822ffcdc32ffa3d6126b478e6c3',
      escrow: '0xa9657413e6af77297376c892de6ebdce4c0feda6'
    },
    gethUrl: 'https://e-will.valeyev.ru/geth/',
    swarmUrl: 'https://mh.getmobileup.com/swarm',
    chainID: 9
  },

/*  FOR PROD
  releaseWillTimeout: 2 * 30 * 24 * 3600 * 1000,        // 2 periods (60 days)
  activityConfirmationTimeout: 30 * 24 * 3600 * 1000,   // 1 period (30 days)
  emailConfirmationTimeout: 3600 * 1000                 // 1 hour
*/

  releaseWillTimeout: 1200000,          // 20 minutes for dev mode
  activityConfirmationTimeout: 600000,  // 10 minutes for dev mode
  emailConfirmationTimeout: 60000       // 1 minute for dev mode


};
