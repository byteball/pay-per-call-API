const payPerCall = require("../../");

const payPerCallServer = new payPerCall.Server(60*60*24*7); // we listen on port 6000

payPerCallServer.startWhenReady().then(async function(){ // server will actually starts after the passphrase for headless wallet is entered
	console.error("server started");
	const objPaymentPackage =  JSON.parse(`{"version":"2.0t","signed_message":{"payment_amount":40000,"amount_spent":40000,"period":1,"aa_address":"PHA6RO4FVYKAY5QND77RF4V67ESHLZYJ","channel_parameters":{"timeout":1000,"asset":"base","salt":"2cafcdb3492809b3e4e98a60a4da7a9c9f31b05d767a8933cb","address":"5LWMOVAUVXPJY6YVEXS64OPKKYAKDKJT"}},"authors":[{"address":"5LWMOVAUVXPJY6YVEXS64OPKKYAKDKJT","authentifiers":{"r":"5ddFFncGBpY7m3lhE0zSTsCB7UAkGY3K/uDkAN3e46kj+kuiKhujKLU+Pgg7aYaHu0HsUSguR3JPtZgfuieJhQ=="},"definition":["sig",{"pubkey":"Az8I377Jcg4HdWYIk6IXrOCUcZp6LGKleCZfUNvMKX38"}]}]}
	`); // payment package obtained from peer
	const objPayment = await payPerCallServer.verifyPaymentPackage(objPaymentPackage);
	if (objPayment.error){
		console.error(objPayment.error);
	} else
		console.error("Peer paid " + objPayment.amount + " in " + objPayment.asset);
	
}).catch(function(error){
	console.error(error);
});;

