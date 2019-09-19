const payPerCall = require("../../");

const payPerCallServer = new payPerCall.Server(60*60*24*7); // we listen on port 6000

payPerCallServer.startWhenReady().then(async function(){ // server will actually starts after the passphrase for headless wallet is entered
	console.error("server started");

	//here we parse a payment package received from client in JSON format (replace with one generated for your server address otherwise it won't work)
	const objPaymentPackageFromPeer =  JSON.parse(`
	{
		"version":"2.0t",
		"signed_message":{"payment_amount":40000,"amount_spent":80000,"period":1,"aa_address":"PHA6RO4FVYKAY5QND77RF4V67ESHLZYJ",
		"channel_parameters":{
		"timeout":1000,
		"asset":"base",
		"salt":"2cafcdb3492809b3e4e98a60a4da7a9c9f31b05d767a8933cb",
		"address":"5LWMOVAUVXPJY6YVEXS64OPKKYAKDKJT"
		}
	},
	"authors":[{"address":"5LWMOVAUVXPJY6YVEXS64OPKKYAKDKJT",
	"authentifiers":{"r":"2wBjjuqlet8lAOsWt6a1csiPMwV8Boc3Ly4JRyEcZuweGGnnPOBQaODCiuOCxe+xT7bc5681eA7+Jr8xmbnGdg=="},
	"definition":["sig",{"pubkey":"Az8I377Jcg4HdWYIk6IXrOCUcZp6LGKleCZfUNvMKX38"}]}]
	}`); // payment package obtained from peer

	const objPaymentFromClient = await payPerCallServer.verifyPaymentPackage(objPaymentPackageFromPeer);
	if (objPaymentFromClient.error){
		console.error(objPaymentFromClient.error);
	} else
		console.error("Peer paid " + objPaymentFromClient.amount + " in " + objPaymentFromClient.asset + " using channel " + objPaymentFromClient.aa_address);

//let's say we decide to refund 5000 to client, we create a payment package to be sent back
	try {
		const objPaymentPackageForPeer = await payPerCallServer.getPaymentPackage(5000, objPaymentFromClient.aa_address);
		console.error(JSON.stringify(objPaymentPackageForPeer));
	} catch (error){
		console.error("Coudln't create payment package, reason: " + error);
	}

});
