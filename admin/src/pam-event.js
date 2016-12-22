class PamEventEmitter {
	checkPool(name){
		if (typeof(this._evpool) !== 'object') {
			this._evpool = {};
			return this.checkPool(...arguments);
		}

		if (!Array.isArray(this._evpool[name])) {
			this._evpool[name] = [];
			return this.checkPool(...arguments);
		}

		return this._evpool[name];
	}
	emit(name, ...args){
		this.checkPool(name).forEach(cb => cb(...args));
		return this;
	}
	on(name, ...args){
		this.checkPool(name).push(...args);
		return this;
	}
	remove(name, ...args){
		this._evpool[name] = this.checkPool(name).filter(cb => !args.includes(cb));
	}
	clear(name){
		this.checkPool(name).splice(0);
	}
}

try {
	module.exports = PamEventEmitter;
} catch (e) {

}
