# pay-per-call-API

This package provides an easy way to add pay-per-call payments to an existing API by using [O<sub>byte</sub> payment channels](https://github.com/Papabyte/aa-channels-lib/).
On client side, a payment package object is generated on request. On server side, a function can verify the payment package and returns the amount received. 

## Server side

* Add to your project `npm install --save https://github.com/Papabyte/pay-per-call-API`

* Create a conf.js file in your project root folder

```javascript
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

```
* Add to your project `npm install --save https://github.com/Papabyte/pay-per-call-API`

* Require module `const payPerCall = require("pay-per-call-API");`

* Initialize `const payPerCallServer = new payPerCall.Server(max sweeping period in seconds);`

* Start server node
```javascript
payPerCallServer.startWhenReady().then(function(){ // server will actually starts after the passphrase for headless wallet is entered
	console.error("server started");
});
```

* Verify a payment package received from peer

```javascript
const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
if (objPayment.error){
	console.error(objPayment.error);
} else
	console.error("Peer paid " + objPayment.amount + " in " + objPayment.asset + " using channel " + objPayment.aa_address);
```


* Get payment package (can be used to refund a client if his request couldn't be served)
```javascript
try {
	const objPaymentPackage = await payPerCallClient.createPaymentPackage(amount, aa_address).then(function(objPaymentPackage){
	});
} catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

## Client side

* Create a conf.js file in your project root folder
```javascript
exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API client';

exports.defaultTimeoutInSecond = 1000; // default timeout for channel creation
```

* Require module `const payPerCall = require("pay-per-call-API");`

* Initialize `const payPerCallClient = new payPerCall.Client(peer address, asset, deposits amount, refill threshold);`

* Start client
```javascript
payPerCallClient.startWhenReady().then(async function(){ // client will actually starts after the passphrase for headless wallet is entered
	console.error("client started");
});
```

After client started, these functions are available:

* Get payment package
```javascript
try {
	const objPaymentPackage = await payPerCallClient.createPaymentPackage(amount)
} catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

* Verify a payment package received from server

```javascript
const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
if (objPayment.error){
	console.error(objPayment.error);
} else
	console.error("Peer paid " + objPayment.amount + " in " + objPayment.asset + " using channel " + objPayment.aa_address);
```

* Sweep channel (closing then reopening) when convenient `client.sweepChannel();`, it should happen within the max sweeping period imposed by the server.

* Close channel when you don't need it anymore `client.closeChannel()`
