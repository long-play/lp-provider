module.exports.cron = {
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
    schedule: '0 */2 * * * *',
    onTick: function () {
      EthereumService.handleNewWills();
    },
    runOnInit: true
  }
};
