## Configuration

The configuration is set from a `conf.js` placed in the project folder.

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

*`bLight`* `boolean` - `true` to run Obyte light node, `false` to run full node.
	- full node: has to sync the whole DAG prior to operations
	- light node: no sync require, but confirmed deposits to AA will be seen after a few minutes lag

*`bSingleAddress`* `boolean` - must be `true`.

*`hub`* `string` - the hub the node will connect to.

*`minChannelTimeoutInSeconds`* `number` - minimal timeout in seconds acceptable for a channel created by client.
*`maxChannelTimeoutInSeconds`* `number` - maximal timeout in seconds acceptable for a channel created by client.

Longer timeouts are safer but unlocking your money from a payment channel would also take longer in case of unilateral closing of a channel (usually the channels are closed cooperatively and the money is unlocked within minutes). Your server node should not go offline for periods longer than `minChannelTimeoutInSeconds` to be able to monitor the channels and prevent fraud. Values between a few hours and a few days are recommended in most cases.

*`unconfirmedAmountsLimitsByAssetOrChannel`* `object` - set limits for payment backed with unconfirmed deposits.
	- *property name*: the asset to which the limits apply (`base` for bytes)
	- *max_unconfirmed_by_asset*: number - maximal unconfirmed amount that can be accepted over all channels for an asset at anytime. Smaller number is safer but some clients might be unable to use the API before their first payment is confirmed if too many clients try to open their channels at the same time. Set to 0 to disable unconfirmed deposits.
	- *max_unconfirmed_by_channel*: number - maximal unconfirmed amount in this asset that can be accepted per channel at anytime.  Smaller number is safer.  Set to 0 to disable unconfirmed deposits.
	- *minimum_time_in_second*: number - time in seconds after deposit when unconfirmed amount can be taken into account. Higher number is safer, it will allow to be more certain that there are no double-spends. Smaller delay allows clients to start using the API faster.

## Create server instance

```javascript
const payPerCall = require("pay-per-call-API");
const payPerCallServer = new payPerCall.Server(maxSweepingPeriod, rpcPort);
```

#### Parameters

*`maxSweepingPeriod`* `number` - Time in seconds after which the server will automatically close the channel if client didn't do it meanwhile.
*`rpcPort`* `number` - (optional) local port to be listened by [RPC server](RPC.md)


## Verify a payment package received from client

```javascript
const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
```

#### Parameters

*`objPaymentPackage`* `object` payment package provided by peer

#### Promise

*`objPayment`* `object`
- objPayment.error: `string` - Verification error , null if verification successful
- objPayment.amount: `number` - Payment amount
- objPayment.asset: `string` - Payment asset, `base` for payment in bytes
- objPayment.aa_address: `string` - Channel address

#### Recommendations
Inspect the `objPayment` object to check that the amount received matches the price of the request and the payment was in the right asset.

If the payment is less than expected, refuse the request and refund (see the next section).

If the payment is more than expected, you can opt to still provide the service and refund the difference, or just reject and refund in full.

If any other parameters are invalid or you failed to provide the service, refund.

## Create a payment package for client

Call this function if you need to refund the client (e.g. you can't serve its request or the client overpaid).
```javascript
try {
	const objPaymentPackage = await payPerCallServer.createPaymentPackage(amount, aa_address);
}
catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

#### Parameters

*`amount`* `number` payment amount
*`aa_address`* `string` - Channel address

#### Promise
*`objPaymentPackage`* `object` - package to be transmitted to peer

`createPaymentPackage` will throw an error if package couldn't be created.



