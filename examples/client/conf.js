exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API client';

exports.defaultTimeoutInSecond = 1000; // default timeout for channel creation