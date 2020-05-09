## RPC mode

The pay-per-call API client can run a RPC server to which other software can connect to. To enable it, set the local port that should be listened as last parameter of instance constructor. In the example below we listen port 2500:

```javascript
const payPerCall = require("pay-per-call-API");
const payPerCallClient = new payPerCall.Client("6BEYY3GWGKKFFJAM6AN22AS4VPQHDBG6", null, 100000, 20000, 2500);
```

All functions are available through RPC calls following JSON-RPC 2.0 Specification.


#### createPaymentPackage

###### call
```JSON
curl  -d '{"jsonrpc": "2.0", "id":"createPaymentPackageTest", "method": "createPaymentPackage", "params": [40000] }' http://127.0.0.1:2500/
```

###### result
```JSON
{"version":"2.0t","signed_message":{"payment_amount":40000,"amount_spent":40000,"period":1,"aa_address":"GCMUXGHDO5ZFKRWWLWVNPPJEGTKYNS6B","channel_parameters":{"timeout":1000,"asset":"base","salt":"a103be1657570731e121c8c65c294e96628e810ab26c1abb6a","address":"ANJFTHPJLZYP7CIORXN2RTHXWCQMTQQ2"}},"authors":[{"address":"ANJFTHPJLZYP7CIORXN2RTHXWCQMTQQ2","authentifiers":{"r":"LAeipSiLu4qWSQpg+ZzLmfv8UBIVAJbD1fIPDhEVQzkcKxKqHlHcJl6iTyq0b5Iw7EinUQS89JxiC3ujjEKb8w=="},"definition":["sig",{"pubkey":"A2iEMPQFncsH/VqKcF0pVtN58doQMJLth+z4vkcchIbT"}]}]}
```

#### verifyPaymentPackage

###### call
```JSON
curl -d '{"jsonrpc": "2.0", "id":"verifyPaymentPackageTest", "method": "verifyPaymentPackage", "params": [{"version":"2.0t","signed_message":{"payment_amount":10000,"amount_spent":10000,"period":1,"aa_address":"GCMUXGHDO5ZFKRWWLWVNPPJEGTKYNS6B"},"authors":[{"address":"6BEYY3GWGKKFFJAM6AN22AS4VPQHDBG6","authentifiers":{"r":"mRqudkrxlcXtib/Gc60emHF9fwO+wZZ4Q+RDxxtiuiM/UmV82dVPAaCVSApHGDDyJKXECzzEzPAaByN0JIh07g=="},"definition":["sig",{"pubkey":"AozI5ukSux5TGtRVRPeRTiWRA+xsZvDweo/tXQgyl9Ei"}]}]}]}' http://127.0.0.1:2500/
```

###### result
```JSON
{"jsonrpc":"2.0","result":{"amount":10000,"asset":"base","aa_address":"GCMUXGHDO5ZFKRWWLWVNPPJEGTKYNS6B"},"id":"verifyPaymentPackageTest"}
```

#### sweep
```JSON
curl -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id":"sweepTest", "method": "sweep", "params": [] }' http://127.0.0.1:2500/
```

###### result
```JSON
{"jsonrpc":"2.0","result":"channel is being swept","id":"sweepTest"}
```

#### close
```JSON
curl -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id":"closeTest", "method": "close", "params": [] }' http://127.0.0.1:2500/
```

###### result
```JSON
{"jsonrpc":"2.0","result":"channel is closing","id":"closeTest"}
```


#### errors
An error is returned when the called function throws an error.
Example:
```JSON
{"jsonrpc":"2.0","error":{"code":-32603,"message":"closing in progress"},"id":"closeTest"}
```