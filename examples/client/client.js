const payPerCall = require("../../");

const payPerCallClient = new payPerCall.Client("CWNPFF6YAZWFEOZXKRB6527NZ47OFYRE", null, 50000, 10000); // (peer url, asset, deposits amount, refill threshold)

payPerCallClient.startWhenReady().then(async function(){
	console.error("client started");

	await payPerCallClient.getPaymentPackage(40000).then(function(objPaymentPackage){
		console.error(JSON.stringify(objPaymentPackage));
	}).catch(function(error){
		console.error(error);
	});

}).catch(function(error){
	console.error(error);
});;



