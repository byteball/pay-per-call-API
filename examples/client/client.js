const payPerCall = require("../../");

const payPerCallClient = new payPerCall.Client("CWNPFF6YAZWFEOZXKRB6527NZ47OFYRE", null, 100000, 20000); // (peer url, asset, deposits amount, refill threshold)

payPerCallClient.startWhenReady().then(async function(){
	console.error("client started");

	//we generate a payment package
	try{
		const objPaymentPackage = await payPerCallClient.getPaymentPackage(40000);
	} catch {
		console.error("Coudln't create payment package, reason: " + error);
	}


});



