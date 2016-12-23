const auth = new PamAuth;
const panel = new PamPanel;
const list = new PamList;
const editor = new PamEditor;

panel.bind($$('.panel'));
panel.on('command-new', function (){
	console.info('new command');
	console.log(...arguments);
})

auth.on('success', function (authFadeOut) {
	authFadeOut(function () {
		CORE.getArticles(1);
	})
})
auth.start();
list.start();

list.on('create', e => {
	panel.trigger('new');
});

CORE.on('get-articles', obj => {
	list.render(obj.list);
});
