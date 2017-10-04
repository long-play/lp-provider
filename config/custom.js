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
  aws: {
    accessKeyId: 'AKIAIKYMRCXEHUTSUAVQ',
    secretAccessKey: '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',
    region: 'us-east-1'
  },

  etherscan: {
    apiKey: 'Z8B4AWI1AXU2JYD6P9HD7I3G9HZPWQPGKH',
  },

  providerInfo: {
    email: 'vps2017@valeyev.ru',

    address: '0x6c5c54a152d4ad644002668b0b3b371cea86daa3',
    publicKey: '0x043ff0b40b4db4c26e022b691d91ad92f230ca81822a51ba9254d9f246508353f98a03c3355d5c81053893dfdf81ba9e0abcf87b6a55cd5d749be07c5902c289f5',
    privateKey: '0x7a5c6539d61903d1baac402cba7c83d612ab4dfefdb97d9f6f93edc32857e6fe'
  },

  emailConfirmationTimeout: 60000 // 1 minute for dev mode


};
