# Pay-Per-Call API Library

This library allows to extend any API with micropayments that flow directy between client and server, no third parties, no intermediaries.

Micropayments are signed messages that are included as part of client requests, the server verifies them before providing the service.  Each payment pays only for the request it comes with and can be as small as a fraction of a cent.

The client and server don't need to trust each other, they can easily start working with unknown peers without any registrations, the client's risk exposure is equal to the price of one request.

The library uses [O<sub>byte</sub> payment channels](https://github.com/Papabyte/aa-channels-lib/) under the hood. It can work with any crypto asset issued on O<sub>byte</sub>, including stablecoins.

Currently, the library works on testnet only, it will be available on livenet once Autonomous Agents are released there. Stablecoins will become available soon after.

Existing APIs can be extended to accept payments using this library:
```diff
Request parameters:

* field1: description of field1
* field2: description of field2
+ payment_package: JSON-encoded payment package that contains a payment for this request

Response parameters:

* field1: description of field1
* field2: description of field2
+ payment_package: (optional) JSON-encoded payment package that contains a refund in case the request was not processed
```

## Server side

* Add to your project `npm install --save https://github.com/byteball/pay-per-call-API`

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

* Require module `const payPerCall = require("pay-per-call-API");`

* Initialize `const payPerCallServer = new payPerCall.Server(max_sweeping_period_in_seconds);`

* Verify a payment package received from a client

```javascript
const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
if (objPayment.error){
	console.error(objPayment.error);
}
else
	console.error("Peer paid " + objPayment.amount + " in " + objPayment.asset + " using channel " + objPayment.aa_address);
```


* Create payment package (can be used to refund a client if its request couldn't be served)
```javascript
try {
	const objPaymentPackage = await payPerCallServer.createPaymentPackage(amount, aa_address);
}
catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```
* When you first run your nodejs application, note the address it prints:
```
====== my single address: SPV5WIBQQT4DMW7UU5GWCMLYDVNGKECD
```
Publish this address on your website for clients to open channels with you.

See detailed [documentation](examples/server/README.md)

## Client side

* Add to your project `npm install --save https://github.com/byteball/pay-per-call-API`

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

* Initialize `const payPerCallClient = new payPerCall.Client(peer_address, asset, deposit_amount, refill_threshold);`

	Here `peer_address` is the address of the service provider you found on its website.

* Create payment package
```javascript
try {
	const objPaymentPackage = await payPerCallClient.createPaymentPackage(amount);
}
catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

* Verify a payment package received from server (for example, if the server refunded a payment):

```javascript
const objPayment = await payPerCallClient.verifyPaymentPackage(objPaymentPackage);
if (objPayment.error){
	console.error(objPayment.error);
}
else
	console.error("Peer paid " + objPayment.amount + " in " + objPayment.asset + " using channel " + objPayment.aa_address);
```

* Sweep channel (closing then reopening) when convenient `client.sweep();`, it should happen within the max sweeping period imposed by the server.

* Close channel when you don't need it anymore `client.close()`

* When you first run your nodejs application, note the address it prints
```
====== my single address: SPV5WIBQQT4DMW7UU5GWCMLYDVNGKECD
```
Send some money to this address before opening the first channel.

See detailed [documentation](examples/client/README.md)


## How it works

Here is a brief description of how payment channels employed by this library work under the hood.

The client deposits funds to an Autonomous Agent (AA) that will safely store the funds and release them to client and server when closing the channel. Then, instead of sending microtransactions onchain, the client and server exchange signed messages offchain, the messages basically saying `I’m peer A, I owe X bytes to peer B`.

For each payment from client to server, `X` is increased by the desired payment amount and the server checks that the difference with previous signed message will cover the amount. `X` is never decreased; when the server wants to send a refund, it sends a message saying `I’m peer B, I owe Y bytes to peer A`.

When any party decides to close the channel, it provides to AA the last message signed by its peer indicating how much the peer owes as well as the amount it owes to peer. There is then a timeout period during which the peer can contest if the closing party was dishonest by lowering the amount it owns. The peer either confirms or provides a fraud proof if the closing party was dishonest.

It's important that server and client stay online while they have a channel opened to watch for any attempt of fraudulent closure.

For better user experience, it's possible to accept unconfirmed transactions as deposit so client can start to use API without waiting after having deposited the funds. Settings are available to mitigate the risk of double-spending fraud attempts.

This library doesn't handle any communication. Instead, it piggybacks on the existing communication channel established by the API. On client side, a payment package object is generated by the library when the client wants to send money. On server side, a function can verify the payment package. The server can optionally return any overpaid amount in its response the same way the client sends money to the server. The packages are transmitted as part of request and response parameters of your API, the exact details of their encoding within requests and responses are up to your application.
