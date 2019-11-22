## Configuration

The configuration is set from a `conf.js` placed in the project folder.

```javascript
exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'pay-per-call API client';

exports.defaultTimeoutInSeconds = 1000; // default timeout for channel creation
```

*`bLight`* `boolean` - `true` to run Obyte light node, `false` to run full node. For an API client, light is recommended.

*`bSingleAddress`* `boolean` - must be `true`.

*`hub`* `string` - the hub the node will connect to.

*`defaultTimeoutInSeconds`* `number` - timeout in seconds for channel closure confirmation, must be in the range accepted by server. Longer timeouts are safer but unlocking your money from a payment channel would also take longer in case of unilateral closing of a channel (usually the channels are closed cooperatively and the money is unlocked within minutes). Your client node should not go offline for periods longer than `defaultTimeoutInSeconds` to be able to monitor the channels and prevent fraud. Values between a few hours and a few days are recommended in most cases.


## Create client instance

```javascript
const payPerCall = require("pay-per-call-API");
const payPerCallClient = new payPerCall.Client(peer_address, asset, deposit_amount, refill_threshold);
```

#### Parameters

*`peer_address`* `string` - peer payment address
*`asset`* `string` - asset used for payments, `base` for bytes
*`deposit_amount`* `number` - amount of first deposit and subsequent refillings
*`refill_threshold`* `number` - available spendable amount below which a new deposit will be made


## Create a payment package for server
```javascript
try {
	const objPaymentPackage = await payPerCallClient.createPaymentPackage(amount);
}
catch (error){
	console.error("Couldn't create payment package, reason: " + error);
}
```

#### Parameters

*`amount`* `number` payment amount

#### Promise
*`objPaymentPackage`* `object` - package to be transmitted to server

`createPaymentPackage` will throw an error if package couldn't be created.


## Verify a payment package received from server

You might receive such payment in the server's response if the server sent a refund (e.g. it can't serve your request or you overpaid in your request).
```javascript
const objPayment = await payPerCallClient.verifyPaymentPackage(objPaymentPackage);
```

#### Parameters

*`objPaymentPackage`* `object` payment package sent by the server

#### Promise

*`objPayment`* `object`
- objPayment.error: `string` - Verification error, null if verification successful
- objPayment.amount: `number` - Payment amount
- objPayment.asset: `string` - Payment asset, `base` for payment in bytes
- objPayment.aa_address: `string` - Channel address

#### Recommendations
If your request was rejected by the server for any reason, check that you received a refund in the server's response and that it matches the amount you paid.

## Sweep channel 

```javascript
client.sweep();
```
Closes the channel and frees up all the unspent money left on the channel. The channel will be automatically reopened if you send another request.

## Close channel 

```javascript
client.close();
```
Closes the channel and sets refill amount to 0, so it will not be reopened.
