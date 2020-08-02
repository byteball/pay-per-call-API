const payPerCall = require("../../");
const payPerCallServer = new payPerCall.Server(60*60*24*7);

setTimeout(start, 3000); // we let time to refresh history

async function start(){
	//here we parse a payment package received from client in JSON format (replace with one generated for your server address otherwise it won't work)
	const objPaymentPackageFromPeer =  JSON.parse(
	`{
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
	}`); // payment package obtained from peer

	const objPaymentFromClient = await payPerCallServer.verifyPaymentPackage(objPaymentPackageFromPeer);
	if (objPaymentFromClient.error){
		console.error(objPaymentFromClient.error);
	} else
		console.error("Peer paid " + objPaymentFromClient.amount + " in " + objPaymentFromClient.asset + " using channel " + objPaymentFromClient.aa_address);

	//let's say we decide to refund 5000 to client, we create a payment package to be sent back
	try {
		const objPaymentPackageForPeer = await payPerCallServer.createPaymentPackage(5000, objPaymentFromClient.aa_address);
		console.error(JSON.stringify(objPaymentPackageForPeer));
	} catch (error){
		console.error("Coudln't create payment package, reason: " + error);
	}
}