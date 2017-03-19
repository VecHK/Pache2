var objExt = function (source, newobj){
	return Object.keys(newobj).filter(key => {
		source[key] = newobj[key]
		return true
	}).length
};

function GroComponent(classFn) {
	if (!classFn.prototype.__init) {
		GroComponent.prototype.__init = function () {}
	}
	return classFn
}

function GroCreate(obj) {
	let GroContext = null
	function GroFetchInit(context) {
		if (context.__proto__.__init) {
			context.__proto__.__init.apply(GroContext)
			return GroFetchInit(context.__proto__)
		}
	}
	class GroClassFn {
		constructor(...args) {
			GroContext = this
			this.__construct.apply(this, args)
			GroFetchInit(this)
		}
	}
	if (obj) {
		objExt(GroClassFn.prototype, obj)
	}
	return GroClassFn;
}

class ASD extends GroCreate({ value: 9 }) {
	__construct(a) {
		alert(a)
	}
	__init() {
		alert('ASD')
	}
}
class DSA extends ASD {
	__init() {
		alert('DSA')
	}
}
