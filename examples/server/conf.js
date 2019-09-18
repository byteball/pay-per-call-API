exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API server';

exports.minChannelTimeoutInSecond = 1000; // minimal channel timeout acceptable
exports.maxChannelTimeoutInSecond = 1000;  // maximal channel timeout acceptable

exports.unconfirmedAmountsLimitsByAssetOrChannel = { // limits for accepting payments backed by unconfirmed deposit from peer
	"base" : {
		max_unconfirmed_by_asset : 1e6,
		max_unconfirmed_by_channel : 1e6,
		minimum_time_in_second : 5
	}
}
