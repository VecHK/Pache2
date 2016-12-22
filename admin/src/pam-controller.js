const auth = new PamAuth;

auth.on('success', function (randomCode, authFadeOut) {
	CORE.randomCode = randomCode;
	authFadeOut(function () {
		alert('登陆成功！');
	})
})

auth.start();
