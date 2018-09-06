module.exports.cron = {
  handleNewWills: {
    schedule: '0 5 * * * *',
    onTick: function () {
      EthereumService.handleNewWills();
    },
    runOnInit: true
  }
};
