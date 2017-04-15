(function (){
	const ObjecExtends = (source, add) => {
		Object.keys(add).forEach(addProperty => {
			source[addProperty] = add[addProperty];
		});
	};
	const selector = (sel, ele) => {
		ele = ele || document;
		if (typeof(sel) !== 'string') {
			return [sel];
		} else {
			return Array.prototype.slice.call(ele.querySelectorAll(sel));
		}
	};

	const DOMMethod = {
		fadeIn(cb, time = 618) {
			this.forEach(ele => {
				ele.style.opacity = 0;
				ele.style.transition = 'opacity '+ time +'ms';
				ele.style.webkitTransition = 'opacity '+ time +'ms';

				ele.style.display = '';
				ele.style.display = getComputedStyle(ele, null).getPropertyValue('display');

				setTimeout(function (){
					ele.style.opacity = 1;
					setTimeout(function (){
						cb && cb();
					}, time);
				}, 16.8);
			})
		},
		fadeOut(cb, time = 618) {
			this.forEach(ele => {
				ele.style.opacity = 1;
				ele.style.transition = 'opacity '+ time +'ms';
				ele.style.webkitTransition = 'opacity '+ time +'ms';

				setTimeout(function (){
					ele.style.opacity = 0;
					setTimeout(function (){
						ele.style.display = 'none';
						console.warn(cb);
						cb && cb();
					}, time);
				}, 16.8);
			})
		},
		remove(){
			this.forEach(ele => {
				ele.parentNode.removeChild(ele)
			})
			return this
		},
		html(value){
			if (typeof(value) !== 'undefined') {
				this.forEach(ele => {
					ele.innerHTML = value;
				})
			} else {
				return this.map(ele => {
					return ele.innerHTML;
				});
			}
		},
		text(value){
			if (typeof(value) !== 'undefined') {
				this.forEach(ele => {
					ele.innerText = value;
				});
				return this;
			} else {
				let textArr = this.map(ele => ele.innerText);
				if (textArr.length === 1) {
					textArr = textArr[0];
				}
				return textArr;
			}
		},
		cssSingle(cssObj){
			Object.keys(cssObj).forEach(property => this.setCss(property, cssObj[property]))
			return this
		},
		setCss(property, value){
			this.forEach(ele => ele.style[property] = value)
			return this
		},
		css(){
			if (arguments.length === 0) {
			} else if (arguments.length === 1) {
				return this.cssSingle(...arguments)
			} else if (arguments.length >= 2) {
				return this.setCss(...arguments)
			}
		},

		class(...classArr){
			this.forEach(ele => {
				classArr.forEach(className => ele.classList.add(className))
			})
			return this;
		},
		classRemove(...classArr) {
			this.forEach(ele => {
				classArr.forEach(className => ele.classList.remove(className))
			})
			return this;
		},
		append(...eleArr) {
			eleArr.forEach(ele => {
				if (Array.isArray(ele)) {
					this.append(...ele)
				} else {
					this[0].appendChild(ele)
				}
			})
			return this
		},
		getAttributesValue(attrEle, name){
			let attr = attrEle.attributes.getNamedItem(name);
			if (attr === null) {
				return null
			} else {
				return attr.value
			}
		},
		getAttr(name){
			let elementAttributesArr = this.map(ele =>
				vools(`[${name}]`, ele).map(attr => this.getAttributesValue(attr, name)).map(valueArr => {
					if (valueArr.length === 1) {
						valueArr = valueArr[0]
					}
					return valueArr
				})
			)

			if (elementAttributesArr.length === 1) {
				return elementAttributesArr[0]
			} else {
				return elementAttributesArr
			}
		},
		setAttr(name, value){
			this.forEach(ele => {
				ele.setAttribute(name, value)
			})
			return this
		},
		attr(name, value){
			if (arguments.length === 0) {
				return this.map(attrEle => {
					return this.getAttributesValue(attrEle)
				})
			} else if (arguments.length === 1) {
				return this.getAttr(name)
			} else if (arguments.length > 1) {
				return this.setAttr(name, value)
			}
		},
	};
	const DOMs = function (sel, ele) {
		ObjecExtends(this, DOMMethod);
	};
	DOMs.prototype = Array.prototype;

	const vools = function (sel, ele) {
		const doms = new DOMs;
		const domArr = selector(sel, ele);
		domArr.forEach(element => doms.push(element));

		return doms;
	};

	vools.create = eleName => {
		return vools(document.createElement(eleName))
	};

	const stringifyRequest = (() => {
		const backValueKey = (key, value) => `${key}=` + encodeURIComponent(value);
		const stringifyArray = (key, arr) => arr.length ? arr.map(item => backValueKey(key, item)).join('&') : backValueKey(key, '');
		const fetcher = (data, key) => Array.isArray(data[key]) ? stringifyArray(key, data[key]) : backValueKey(key, data[key]);
		return data => Object.keys(data).map(key => fetcher(data, key)).join('&');
	})();
	vools.pjax = function (url, args) {
		const xhr = new XMLHttpRequest;
		if (args.method === undefined) {
			throw new Error('请求方法未指定');
		}
		return new Promise((resolve, reject) => {
			xhr.onloadend = () => {
				if (xhr.status === 200) {
					resolve(xhr.responseText, xhr.status, xhr);
				} else {
					const err = new Error('status is not 200');
					err.status = xhr.status;
					err.responseText = xhr.responseText;
					err.xhr = xhr;
					reject(err);
				}
			};

			xhr.open(args.method.toUpperCase(), url, true);
			if (args.data !== undefined) {
				if (args.type === 'json') {
					xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
				} else if ('type' in args) {
					xhr.setRequestHeader("Content-Type", atgs.type);
				} else {
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
				}

				if (/json/.test(args.type)) {
					xhr.send(JSON.stringify(args.data))
				} else if (typeof args.data === 'object') {
					let formated = stringifyRequest(args.data);
					xhr.send(formated);
				} else {
					xhr.send(args.data);
				}
			} else {
				xhr.send();
			}
		});
	};
	vools.get = function (url) {
		return vools.pjax(url, { method: 'GET' })
	};
	vools.post = function (url, data = {}) {
		return vools.pjax(url, { method: 'POST', data })
	};
	vools.patch = function (url, data = {}) {
		return vools.pjax(url, { method: 'PATCH', data });
	};
	vools.delete = function (url, data = {}) {
		return vools.pjax(url, { method: 'DELETE', data });
	};
	vools.rjax = (() => {
		return (url, args) => {
			var xhr = new XMLHttpRequest;

			xhr.onloadend = () => {
				if (xhr.status === 200) {
					args.success && args.success(xhr.responseText, xhr.status, xhr);
				} else {
					args.fail && args.fail(xhr.responseText, xhr.status, xhr);
				}
			};
			if (args.method === undefined) {
				throw new Error('请求方法未指定');
			}

			xhr.open(args.method.toUpperCase(), url, true);
			if (args.data !== undefined) {
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
				if (typeof args.data === 'object') {
					let formated = stringifyRequest(args.data);
					xhr.send(formated);
				} else {
					xhr.send(args.data);
				}
			} else {
				xhr.send();
			}
		};
	})();

	vools.browser

	const voolsEvent = function (){};
	ObjecExtends(voolsEvent.prototype, {

	});
	if (window.define) {
		define(() => [
			vools,
			function () { return vools.apply(null, arguments).pop() }
		])
	} else {
		window.voolsEvent = voolsEvent;

		window.vools = vools;
		window.$ = vools;
		window.$$ = function (){
			return vools.apply(null, arguments)[0];
		};
	}
})();
