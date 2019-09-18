const channels = require("aa-channels-lib");
const eventBus = require("ocore/event_bus.js");
const validationUtils = require('ocore/validation_utils.js');
const db = require('ocore/db.js');

var isHeadlessReady = false;

eventBus.on('headless_wallet_ready', function(){
	isHeadlessReady = true;
});

class Server {
	constructor(sweepingPeriod) {
		this.sweepingPeriod = sweepingPeriod;
	}

	startWhenReady(){
		return new Promise((resolve) => {
			if (isHeadlessReady){
				setTimeout(()=>{
					this.start();
					return resolve();
				},2000);
			} else {
				eventBus.on('headless_wallet_ready', ()=>{
					setTimeout(()=>{
						this.start();
						return resolve();
					},2000);
				});
			}
		})
	}

	start(){
		if (!isHeadlessReady)
			throw Error("Headless not ready");
		setInterval(()=>{
			this.sweepChannelsIfPeriodExpired(this.sweepingPeriod);
		}, 60000);
	}
	// we read timestamp corresponding to last updating mci of opened channel, if too old we close it to sweep fund on it
	sweepChannelsIfPeriodExpired(sweepingPeriod){
		if (!isHeadlessReady)
			throw Error("Headless not ready");
		db.query("SELECT aa_address FROM channels INNER JOIN units ON units.main_chain_index=channels.last_updated_mci \n\
		WHERE status='open' AND (strftime('%s', 'now')-timestamp) > ?", [sweepingPeriod], (rows)=>{
			rows.forEach((row)=>{
				channels.close(row.aa_address, (error)=>{});
			})
		});
	}

	verifyPaymentPackage(objPaymentPackage){
		if (!isHeadlessReady)
			throw Error("Headless not ready");
		return new Promise((resolve, reject) => {
			channels.verifyPaymentPackage(objPaymentPackage, (error, amount, asset)=>{
				if (error){
					console.log(error);
					return resolve({amount:0, error: error});
				}
				else{
					return resolve({amount:amount, asset: asset});
				}
			});
		})
	}

}


class Client {

	constructor(peer_address, asset, fill_amount, refill_threshold) {
		this.peer_address = peer_address;
		this.asset = asset;
		this.fill_amount = fill_amount;
		this.refill_threshold = refill_threshold;
	}

	startWhenReady(){
		return new Promise((resolve, reject) => {
			if (isHeadlessReady){
				setTimeout(()=>{
					this.start().then(resolve, reject);
				}, 2000);
			}
			else {
				eventBus.on('headless_wallet_ready', ()=>{
					setTimeout(()=>{
						this.start().then(resolve, reject);
					}, 2000);				
				});
			}
		})
	}

	start(){
		return new Promise((resolve, reject) => {
			if (!isHeadlessReady)
				throw Error("Headless not ready");
			channels.getChannelsForPeer(this.peer_address, null, (error, aa_addresses) => {
				if (error) {
					console.log("no channel found for this peer, I'll create one");
					channels.createNewChannel(this.peer_address, this.fill_amount, {
						salt: true,
						asset: this.asset
					}, (error, aa_address)=>{
						if (error)
							return reject(error);
						this.aa_address = aa_address;
						channels.setAutoRefill(aa_address, this.fill_amount, this.refill_threshold, ()=>{});
						return resolve();
					});
				} else {
					this.aa_address = aa_addresses[0];
					channels.setAutoRefill(aa_addresses[0], this.fill_amount, this.refill_threshold, ()=>{});
					return resolve();
				}
			});
		});
	}

	getPaymentPackage(amount){
		return new Promise((resolve, reject) => {
			if (!isHeadlessReady)
				return reject("Headless not ready");
			if (!validationUtils.isPositiveInteger(amount))
				return reject("amount must be a positive integer");
			channels.getPaymentPackage(amount, this.aa_address, (error, objSignedPackage)=>{
				if (error)
					return reject(error);
				else
					return resolve(objSignedPackage);
			});
		});
	}

	sweep() {
		return new Promise((resolve, reject) => {
			if (!isHeadlessReady)
				return reject("Headless not ready");
			channels.close(this.aa_address, (error)=>{
				if (error){
					console.log(error + ", will retry later");
					setTimeout(()=>{
						this.close().then(()=>{
							return resolve();
						})
					}, 30000)
				}
			})
		});
	}

	close() {
		return new Promise((resolve, reject) => {
			if (!isHeadlessReady)
				return reject("Headless not ready");
			this.sweep().then(()=>{
				channels.setAutoRefill(this.aa_address, 0, 0, ()=>{
					return resolve();
				});
			});
		});
	}
}

exports.Server = Server;
exports.Client = Client;