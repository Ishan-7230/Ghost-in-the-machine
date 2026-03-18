const config = require('../config');

class LatencySimulator {
  constructor() {
    this.config = config.latency;
  }

  getDelay(commandType) {
    const delays = {
      'simple': this._range(this.config.minCommandDelay, this.config.maxCommandDelay),
      'filesystem': this._range(50, 200),
      'process': this._range(100, 400),
      'network': this._range(300, this.config.networkCommandDelay),
      'heavy': this._range(400, this.config.heavyCommandDelay),
      'compile': this._range(2000, this.config.exploitCompileDelay),
      'transfer': this._range(1000, this.config.fileTransferDelay),
      'exploit': this._range(1500, 4000),
      'sudo': this._range(200, 500),
    };
    return delays[commandType] || delays['simple'];
  }

  async streamOutput(text, callback, charDelay = 2) {
    const lines = text.split('\n');
    for (const line of lines) {
      await this._sleep(Math.random() * 50 + 10);
      callback(line + '\n');
    }
  }

  _range(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = LatencySimulator;
