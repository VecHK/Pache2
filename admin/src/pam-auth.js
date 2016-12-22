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
	setSubmit(randomCode){
		const lthis = this;
		$$('.auth-form', this.container).onsubmit = function () {
			$.rjax('auth', {
				method: 'POST',
				data: {
					pass: md5(randomCode + this.pass.value),
				},
				success(){
					let authFadeOut = function (cb){
						lthis.container.classList.add('auth-logined');
						setTimeout(cb, 618);
					};
					lthis.emit('success', randomCode, authFadeOut);
				},
				fail(errText){
					lthis.emmit('error', ...arguments);
					$$('.description', lthis.container).innerText = errText;
					console.warn(errText);
				},
			});
			return false;
		};
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
		this.getRandom()
			.then((randomCode) => {
				this.setHtml();
				this.setSubmit(randomCode);
			})
			.catch((err) => {
				this.getRandomFail(err);
			})
	}
}
