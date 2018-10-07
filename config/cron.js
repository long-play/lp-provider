module.exports.cron = {
  checkStatus: {
    schedule: '0 */5 * * * *',  // for prod it should be once a day
    onTick: function () {
      EthereumService.checkStatus();
    },
    runOnInit: true
  },

  checkActivity: {
    schedule: '0 */5 * * * *',  // for prod it should be once a day
    onTick: function () {
      ActivityService.check();
    },
    runOnInit: true
  },

  releaseWills: {
    schedule: '0 */5 * * * *',  // for prod it should be once a day
    onTick: function () {
      ActivityService.release();
    },
    runOnInit: true
  },

  handleNewWills: {
    schedule: '*/10 * * * * *',
    onTick: function () {
      EthereumService.handleNewWills();
    },
    runOnInit: true
  }
};
