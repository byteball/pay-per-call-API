const channels = require("aa-channels-lib");
const eventBus = require("ocore/event_bus.js");
const validationUtils = require('ocore/validation_utils.js');
const db = require('ocore/db.js');
const rpc = require('json-rpc2');

var areAAchannelsReady = false;



eventBus.on('aa_channels_ready', function(){
	areAAchannelsReady = true;
});

class Server {
	constructor(sweepingPeriod, rpcPort) {
		this.sweepingPeriod = sweepingPeriod;
		this.sweepChannelsIfPeriodExpired(this.sweepingPeriod);
		if (rpcPort)
			this.initRpcServer(rpcPort);
	}

	initRpcServer(rpcPort){
		var server = rpc.Server.$create();

		server.expose('createPaymentPackage', (args, opt, callback)=>{
			this.createPaymentPackage(args[0], args[1]).then((paymentPackage)=>{
				callback(null, paymentPackage);
			}).catch((error)=>{
				callback(error);
			});
		});

		server.expose('verifyPaymentPackage', (args, opt, callback)=>{
			this.verifyPaymentPackage(args[0]).then((objResult)=>{
				callback(null, objResult);
			})
		});

		server.listen(rpcPort, 'localhost');
	}

	waitNodeIsReady(){
		return new Promise((resolve) => {
			if (areAAchannelsReady){
					return resolve();
			} else {
				eventBus.on('aa_channels_ready', ()=>{
						return resolve();
				});
			}
		})
	}

	// we read timestamp corresponding to last updating mci of opened channel, if too old we close it to sweep fund on it
	async sweepChannelsIfPeriodExpired(sweepingPeriod){
		await this.waitNodeIsReady();
		db.query("SELECT DISTINCT(aa_address) FROM channels INNER JOIN units ON units.main_chain_index=channels.last_updated_mci \n\
		WHERE status='open' AND (strftime('%s', 'now')-timestamp) > ?", [sweepingPeriod], (rows)=>{
			rows.forEach((row)=>{
				channels.close(row.aa_address, (error)=>{});
			})
		});
	}
	async verifyPaymentPackage(objPaymentPackage){
		await this.waitNodeIsReady();
		return verifyPaymentPackage(objPaymentPackage);
	}

	async createPaymentPackage(amount, aa_address) {
		await this.waitNodeIsReady();
		return createPaymentPackage(amount, aa_address);
	}

}


class Client {

	constructor(peer_address, asset, fill_amount, refill_threshold, rpcPort) {
		this.peer_address = peer_address;
		this.asset = asset;
		this.fill_amount = fill_amount;
		this.refill_threshold = refill_threshold;
		this.isInitialized = false;
		this.isClosing = false;
		if (areAAchannelsReady){
			this.start();
		} else {
			eventBus.on('aa_channels_ready', ()=>{
				this.start();
			});
		}

		if (rpcPort)
			this.initRpcServer(rpcPort);
	}

	initRpcServer(rpcPort){
		var server = rpc.Server.$create();

		server.expose('createPaymentPackage', (args, opt, callback)=>{
			this.createPaymentPackage(args[0]).then((paymentPackage)=>{
				callback(null, paymentPackage);
			}).catch((error)=>{
				callback(error);
			});
		});

		server.expose('verifyPaymentPackage', (args, opt, callback)=>{
			this.verifyPaymentPackage(args[0]).then((objResult)=>{
				callback(null, objResult);
			})
		});

		server.expose('sweep', (args, opt, callback)=>{
			this.sweep(true).then(()=>{
				callback(null, "channel is being swept");
			})
		});

		server.expose('close', (args, opt, callback)=>{
			this.close(true).then(()=>{
				callback(null, "channel is closing");
			}).catch((error)=>{
				callback(error);
			});
		});

		server.listen(rpcPort, 'localhost');
	}

	waitNodeIsReady(){
		return new Promise((resolve) => {
			console.log("waitNodeIsReady");
			if (this.aa_address ){
					return resolve();
			} else {
				eventBus.on('client_ready', ()=>{
						return resolve();
				});
			}
		})
	}

	start(){
		channels.getChannelsForPeer(this.peer_address, this.asset, (error, aa_addresses) => {
			if (error) {
				console.log("no channel found for this peer, I'll create one");
				channels.createNewChannel(this.peer_address, this.fill_amount, {
					salt: true,
					asset: this.asset
				}, (error, aa_address)=>{
					if (error)
						throw Error(error);
					console.log("aa_address " + aa_address);
					this.aa_address = aa_address;
					eventBus.emit('client_ready');
					channels.setAutoRefill(aa_address, this.fill_amount, this.refill_threshold, ()=>{});
				});
			} else {
				this.aa_address = aa_addresses[0];
				eventBus.emit('client_ready');
				channels.setAutoRefill(aa_addresses[0], this.fill_amount, this.refill_threshold, ()=>{});
			}
		});
	}

	async verifyPaymentPackage(objPaymentPackage){
		await this.waitNodeIsReady();
		return verifyPaymentPackage(objPaymentPackage);
	}

	async createPaymentPackage(amount) {
		await this.waitNodeIsReady();
		return createPaymentPackage(amount, this.aa_address)
	}

	sweep(bDontRetry) {
		return new Promise(async (resolve, reject) => {
			await this.waitNodeIsReady();
			channels.close(this.aa_address, (error)=>{
				if (error){
					if (bDontRetry){
						reject(error);
					} else {
						console.log(error + ", will retry later");
						setTimeout(()=>{
							this.close().then(resolve);
						}, 30000);
					}
				} else {
					resolve();
				}
			})
		});
	}

	close(bDontRetry) {
		return new Promise(async (resolve, reject) => {
			if (this.isClosing)
				return reject("Already closing");
			else
				this.isClosing = true;
			await this.waitNodeIsReady();
			channels.setAutoRefill(this.aa_address, 0, 0, ()=>{
				this.sweep(bDontRetry).then(()=>{
					resolve();
					this.isClosing = false;
				});
			});
		});
	}
}

function verifyPaymentPackage(objPaymentPackage){
	if (!areAAchannelsReady)
		throw Error("Headless not ready");
	return new Promise((resolve, reject) => {
		channels.verifyPaymentPackage(objPaymentPackage, (error, amount, asset, aa_address)=>{
			if (error){
				console.log(error);
				return resolve({amount:0, error: error});
			}
			else{
				return resolve({amount:amount, asset: asset, aa_address: aa_address});
			}
		});
	})
}

function createPaymentPackage(amount, aa_address){
	return new Promise((resolve, reject) => {
		if (!areAAchannelsReady)
			return reject("Headless not ready");
		if (!validationUtils.isPositiveInteger(amount))
			return reject("amount must be a positive integer");
		channels.createPaymentPackage(amount, aa_address, (error, objSignedPackage)=>{
			if (error)
				return reject(error);
			else
				return resolve(objSignedPackage);
		});
	});
}

exports.Server = Server;
exports.Client = Client;