exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API';
exports.permanent_pairing_secret = '0000';
exports.control_addresses = [''];

exports.minChannelTimeoutInSeconds = 800; // minimal channel timeout acceptable
exports.maxChannelTimeoutInSeconds = 1500;  // maximal channel timeout acceptable
exports.defaultTimeoutInSeconds = 1000; // default timeout for channel creation