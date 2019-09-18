exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API';
exports.permanent_pairing_secret = '0000';
exports.control_addresses = [''];

exports.minChannelTimeoutInSecond = 800; // minimal channel timeout acceptable
exports.maxChannelTimeoutInSecond = 1500;  // maximal channel timeout acceptable
exports.defaultTimeoutInSecond = 1000; // default timeout for channel creation