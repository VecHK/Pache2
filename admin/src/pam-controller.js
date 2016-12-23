const auth = new PamAuth;
const panel = new PamPanel;
const list = new PamList;

auth.on('success', function (authFadeOut) {
	authFadeOut(function () {
		
	})
})

auth.start();
