# pay-per-call-API

This package provides an easy way to add pay-per-call payments to an existing API by using [O<sub>byte</sub> payment channels](https://github.com/Papabyte/aa-channels-lib/).
They deposit funds to an Autonomous Agent that is programmed to release settlement payments according to messages signed by them. Then instead of sending funds onchain, they provide signed messages basically saying `I’m peer A, I owe n bytes to peer B`.\
For each payment, `n` is increased by the desired payment amount and the server checks that the difference with previous signed message will cover the amount.\
`n` being never decreased, when server want to proceed a refund, it sends a message saying `I’m peer B, I owe n bytes to peer A`.\
When a party closes the channel, it provides to AA the last message signed by its peer indicating how much peer owes as well as the amount it owes to peer. There is then a timeout period during which the peer can contest if the peer was dishonest by lowering the amount it owns. The peer either confirms or provides a fraud proof if peer was dishonest.\
It's important that server and client stay online while they have a channel opened to watch for any attempt of fraudulent closure.
For better user experience, it's possible to accept unconfirmed transactions as deposit so user can start to use API without waiting time after having deposited funds. Some settings are available to mitigate the risk of double-spending fraud attempts.\
This library doesn't handle any communication. On client side, a payment package object is generated. On server side, a function can verify the payment package and returns any overpaid amount. How the packages are transmitted is totally up to your application.

## Server side

* Add to your project `npm install --save https://github.com/Papabyte/pay-per-call-API`

* Create a conf.js file in your project root folder

```javascript
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API server';

exports.minChannelTimeoutInSeconds = 1000; // minimal channel timeout acceptable
exports.maxChannelTimeoutInSeconds = 1000;  // maximal channel timeout acceptable

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

* Verify a payment package received from peer

```javascript
const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
if (objPayment.error){
	console.error(objPayment.error);
} else
	console.error("Peer paid " + objPayment.amount + " in " + objPayment.asset + " using channel " + objPayment.aa_address);
```


* Create payment package (can be used to refund a client if his request couldn't be served)
```javascript
try {
	const objPaymentPackage = await payPerCallClient.createPaymentPackage(amount, aa_address);
} catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

See detailed [documentation](examples/server/README.md)

## Client side

* Create a conf.js file in your project root folder
```javascript
exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API client';

exports.defaultTimeoutInSeconds = 1000; // default timeout for channel creation
```

* Require module `const payPerCall = require("pay-per-call-API");`

* Initialize `const payPerCallClient = new payPerCall.Client(peer address, asset, deposits amount, refill threshold);`

* Create payment package
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

See detailed [documentation](examples/client/README.md)