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
			} else {
				let textArr = this.map(ele => ele.innerText);
				if (textArr.length === 1) {
					textArr = textArr[0];
				}
				return textArr;
			}
		},

		append(ele){
			this[this.length - 1].appendChild(ele);
		},
		getAttributesValue(attrEle, name){
			let attr = attrEle.attributes.getNamedItem(name);
			if (attr === null) {
				return null;
			} else {
				return attr.value;
			}
		},
		getAttr(name){
			let elementAttributesArr = this.map(ele =>
				vools(`[${name}]`, ele).map(attr => this.getAttributesValue(attr, name)).map(valueArr => {
					if (valueArr.length === 1) {
						valueArr = valueArr[0];
					}
					return valueArr;
				})
			);

			if (elementAttributesArr.length === 1) {
				return elementAttributesArr[0];
			} else {
				return elementAttributesArr;
			}
		},
		setAttr(name, value){

		},
		attr(name, value){
			if (arguments.length === 0) {
				return this.map(attrEle => {
					return this.getAttributesValue(attrEle)
				});
			} else if (arguments.length === 1) {
				return this.getAttr(name);
			} else if (arguments.length > 1) {
				return this.setAttr(name, value);
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

	vools.rjax = (() => {
		const stringifyRequest = (() => {
			const backValueKey = (key, value) => `${key}=` + encodeURIComponent(value);
			const stringifyArray = (key, arr) => arr.length ? arr.map(item => backValueKey(key, item)).join('&') : backValueKey(key, '');
			const fetcher = (data, key) => Array.isArray(data[key]) ? stringifyArray(key, data[key]) : backValueKey(key, data[key]);
			return data => Object.keys(data).map(key => fetcher(data, key)).join('&');
		})();
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

	const voolsEvent = function (){};
	ObjecExtends(voolsEvent.prototype, {

	});

	window.voolsEvent = voolsEvent;

	window.vools = vools;
	window.$ = vools;
	window.$$ = function (){
		return vools.apply(null, arguments)[0];
	};
})();
