module.exports.cron = {
  checkActivity: {
    schedule: '0 */15 * * * *', // for prod it should be once a day
    onTick: function () {
      ActivityService.check();
    },
    runOnInit: true
  },

  handleNewWills: {
    schedule: '0 */5 * * * *',
    onTick: function () {
      EthereumService.handleNewWills();
    },
    runOnInit: true
  }
};
