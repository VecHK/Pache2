class PamAuth extends PamEventEmitter {
	setHtml(message="Authentication", description="　", authClass){
		const container = $$('.login');
		container.classList.add('pam-auth');
		if (authClass) {
			container.classList.add(authClass);
		}
		container.innerHTML = `
		<div class="message">${message}</div>
		<div class="description">${description}</div>

		<form class="auth-form">
			<input name="pass" placeholder="PASSWORD" type="password" />
		</form>`;

		this.container = container;
	}
	show(cb){
		this.container.style.display = '';
		setTimeout(() => {
			this.container.classList.remove('auth-logined');

			cb && cb();
		}, 20);
	}
	hide(cb){
		this.container.classList.add('auth-logined');
		setTimeout(() => {
			this.container.style.display = 'none';
			cb && cb();
		}, 618);
	}
	loginSuccess(){
		this.emit('success', this.hide.bind(this));
	}
	setSubmit(randomCode){
		const lthis = this;
		$$('.auth-form', this.container).onsubmit = function () {
			const fthis = this;
			$.rjax('auth', {
				method: 'POST',
				data: {
					pass: md5(randomCode + this.pass.value),
				},
				success(){
					CORE.randomCode = randomCode;
					fthis.pass.value = '';
					lthis.loginSuccess();
				},
				fail(errText){
					lthis.emit('pass-error', ...arguments);
					$$('.description', lthis.container).innerText = errText;
					console.warn(errText);
				},
			});
			return false;
		};
	}
	isAuthed(){
		return new Promise((resolve, reject) => {
			$.rjax('authed', {
				method: 'GET',
				success(text){
					try {
						let result = JSON.parse(text);
						console.warn(result);
						if (result) {
							console.log('authed');
							resolve(result);
						} else {
							throw new Error('Authed is not true');
						}
					} catch (e) {
						console.log('not authed');
						reject(e);
					}
				},
				fail(){
					console.warn('authed fail');
					console.warn(...arguments);
					reject(...arguments);
				},
			})
		});
	}
	getRandom(){
		return new Promise((resolve, reject) => {
			$.rjax('auth', {
				method: 'GET',
				success: resolve,
				fail: reject,
			});
		});
	}
	getRandomFail(errText){
		this.setHtml('错误', errText, 'auth-error');
	}

	start(){
		CORE.setStyle('style/pam-auth.css');
		this.setHtml();

		this.isAuthed()
		.then(
			() => this.loginSuccess(),
			() =>
				this.getRandom()
				.then((randomCode) => this.setSubmit(randomCode) )
				.catch((err) => this.getRandomFail(err) )
		)
	}
}
