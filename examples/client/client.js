const payPerCall = require("../../");

const payPerCallClient = new payPerCall.Client("6BEYY3GWGKKFFJAM6AN22AS4VPQHDBG6", null, 100000, 20000); // (peer address, asset, deposits amount, refill threshold)

start();

async function start(){
	console.error("client started");

	//we generate a payment package
	try{
		const objPaymentPackage = await payPerCallClient.createPaymentPackage(40000);
		console.error(JSON.stringify(objPaymentPackage));	// objPaymentPackage can be encoded in JSON with JSON.stringify(objPaymentPackage) and transmitted to server alongside with your request
	} catch (error){
		console.error("Coudln't create payment package, reason: " + error);
	}

	
	//let's say server sent back a refund in JSON format

	//we parse it
	
	const objPaymentPackageFromServer = JSON.parse(`{
			"version": "3.0t",
			"signed_message": {
				"payment_amount": 40000,
				"amount_spent": 40000,
				"period": 1,
				"aa_address": "ZLOL6G2KP5T2QJN7CJIEXU5KWH257L7R",
				"channel_parameters": {
					"timeout": 1000,
					"asset": "base",
					"salt": "f055cdbab16be311b32bff0f6f93391f3bec4f403eed0a58d9",
					"address": "A5BZYPZPBE6WK4WWGNBCDMIIV2SI7GNM",
					"version": "1.0"
				}
			},
			"authors": [{
				"address": "A5BZYPZPBE6WK4WWGNBCDMIIV2SI7GNM",
				"authentifiers": {
					"r": "Bh9nYxl7vWi99bl9JJzgnQIkw35/YH62dwkd9pRUDwZyZ1edJ2/ygaih4m2Rt8jhRbIuRM6LEmcgUT273U7YjA=="
				},
				"definition": ["sig", {
					"pubkey": "AutsyvnjeTMJr+9iGe6w5QIs6n92DIqpYqq1qrxUJ2Z0"
				}]
			}]
		}`
	);

	//it has to be verified with:
	const objRefundFromServer = await payPerCallClient.verifyPaymentPackage(objPaymentPackageFromServer);
	if (objRefundFromServer.error){
		console.error(objRefundFromServer.error);
	} else
		console.error("Peer paid " + objRefundFromServer.amount + " in " + objRefundFromServer.asset + " using channel " + objRefundFromServer.aa_address);

}



