class PamEventEmitter {
	$checkPool(name) {
		if (typeof(this._evpool) !== 'object') this._evpool = {}
		if (!Array.isArray(this._evpool[name])) this._evpool[name] = []

		return this._evpool[name]
	}
	emit(name, ...args) {
		this.$checkPool(name).forEach(cb => cb(...args))
		return this
	}
	on(name, ...args) {
		if (!Array.isArray(name)) name = [ name ]
		name.forEach(nameItem => this.$checkPool(nameItem).push(...args));
		return this
	}
	remove(name, ...args) {
		this._evpool[name] = this.$checkPool(name).filter(cb => !args.includes(cb));
	}
	clear(name) {
		this.$checkPool(name).splice(0);
	}
}
PamEventEmitter.use = function (obj) {
	['on', 'emit', 'clear', 'remove', '$checkPool'].forEach(p => {
		obj[p] = this.prototype[p];
	});
};

try {
	module.exports = PamEventEmitter;
} catch (e) {

}

(function () {
	var EventModel = {
	  /* 查找事件的訂閱池 */
	  _findev: function (name) {
	    /* 如果事件池不存在則創建它 */
	    if (!this._evpool) {
	      this._evpool = {}
	    }
	    /* 如果不存在該訂閱池則創建它 */
	    if (!Array.isArray(this._evpool[name])) {
	      this._evpool[name] = []
	    }
	    /* 返回訂閱池 */
	    return this._evpool[name]
	  },

	  /* 訂閱事件 */
	  on: function (ev_name, handle) {
	    /* this._findev(ev_name) 則會返回對應的訂閱池（數組） */
	    return this._findev(ev_name).push(handle)
	  },

		/* 判斷曾經是否發佈，未發佈則返回 FALSE，並且執行 callback（如果有） */
		isEmited: function (ev_name, callback) {
			var result = this._findEmited()[ev_name]
			if (callback) {
				result || callback(this)
			}
			return result
		},

		_findEmited: function () {
			if (!('_emited' in this)) {
				this._emited = {}
			}
			return this._emited
		},

	  /* 發佈事件 */
	  emit: function (ev_name) {
			this._findEmited()[ev_name] = true

	    /* 保存上下文環境，用於回調函數用的上下文 */
	    var self = this

	    var args = Array.prototype.slice.call(arguments)
	    /* 獲取 ev_name 后的參數，作為回調函數用的參數 */
	    args.shift()

	    /* this._findev(ev_name) 則會返回對應的訂閱池（數組） */
	    return this._findev(ev_name).forEach(function (handle) {
	      handle.apply(self, args)
	    })
	  },

	  /* 移除事件 */
	  remove: function (ev_name, remove_handle) {
	    this._evpool[ev_name] = this._findev(ev_name).filter(function (evHandle) {
	      return evHandle !== remove_handle
	    })
	  },
	}

	try {
		if (window.define) {
			window.define(EventModel)
		} else {
			window.EventModel = EventModel
		}
	} catch (e) {}


	var StorageModel = {
	  reload: function () {
	    try {
	      this.source = JSON.parse(localStorage.storage_source)
	    } catch (e) {
	      this.source = {}
	    }
	    this.emit('reload', this.source)
	  },
	  set: function (name, value) {
	    return this.source[name] = value
	  },
	  get: function (name) {
	    return this.source[name] || null
	  },
	  remove: function (name) {
	    return (delete this.source[name])
	  },
	  save: function () {
	    localStorage.storage_source = JSON.stringify(this.source)
	    this.emit('saved', localStorage.storage_source)
	  },
	  clear: function () {
	    localStorage.removeItem('storage_source')
	    var remove_source = this.source;
	    this.source = {}
	    this.emit('clear', remove_source)
	  },
	}

	StorageModel.__proto__ = Object.create(EventModel)
})()
