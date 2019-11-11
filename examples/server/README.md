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

*`bLight`* `boolean` - `true` to run Obyte light node, `false` to run full node.\
	- full node: has to sync the whole DAG prior to operations\
	- light node: no sync require, but confirmed deposits to AA will be seen after a few minutes lag\

*`bSingleAddress`* `boolean` - must be `true`.

*`hub`* `string` - the hub the node will connect to.

*`minChannelTimeoutInSecond`* `number` - minimal timeout in seconds acceptable for a channel created by client .
*`maxChannelTimeoutInSecond`* `number` - maximal timeout in seconds acceptable for a channel created by client .

*`unconfirmedAmountsLimitsByAssetOrChannel`* `object` - set limits for payment backed with unconfirmed deposits.\
	- *property name*: the asset to which the lmits apply (`base` for bytes)\
	- *max_unconfirmed_by_asset*: number - maximal unconfirmed amount that can be accepted in overall for an asset at anytime\
	- *max_unconfirmed_by_channel*: number - maximal unconfirmed amount in this asset that can be accepted for a channel at anytime\
	- *minimum_time_in_second*: number - time in seconds after deposit when unconfirmed amount can be taken into account\

## Create server instance

```javascript
const payPerCall = require("pay-per-call-API");
const payPerCallServer = new payPerCall.Server(maxSweepingPeriod);
```

#### Parameters

*`maxSweepingPeriod`* `number` - Time in seconds after which the server will automatically close the channel if client didn't do it meanwhile.



## Verify a payment package received from client

```javascript
const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
```

#### Parameters

*`objPaymentPackage`* `object` payment package provided by peer

#### Promise

*`objPayment`* `object`\
- objPayment.error: `string` - Verification error , null if verification successful\
- objPayment.amount: `number` - Payment amount\
- objPayment.asset: `string` - Payment asset, `base` for payment in bytes\
- objPayment.aa_address: `string` - Channel address\

## Create a payment package for client

```javascript
try {
	const objPaymentPackage = await payPerCallClient.createPaymentPackage(amount, aa_address);
} catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

#### Parameters

*`amount`* `number` payment amount\
*`aa_address`* `string` - Channel address\

#### Promise
*`objPaymentPackage`* `object` - package to be transmitted to peer

`createPaymentPackage` will throw an error if package couldn't be created.



