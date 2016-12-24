const CORE = new Pam;
CORE.start();

const auth = new PamAuth;
const panel = new PamPanel;
const list = new PamList;
const editor = new PamEditor;
const articleProfile = new PamArticleProfile;
articleProfile.start();
articleProfile.use(editor);

panel.bind($$('.panel'));

panel.on('command-new', function (){
	editor.apply({
		title: '',
		content: '',
		contentType: 'markdown',
		tags: [],
	})
	editor.show();
});

/* 编辑器提交按钮 */
editor.on('action-submit', status => {
	console.info('action-submit');
	if (CORE.current) {
		CORE.modArticle(CORE.current._id, editor.collect());
	} else {
		CORE.insertArticle(editor.collect());
	}
});

/* 核心 modified */
CORE.on('article-modified', obj => {
	console.info('已修改');
});

/* 核心的 created 事件 */
CORE.on('article-created', obj => {
	CORE.insertedResult = obj.result;

	CORE.current = Object.assign({}, obj.result, editor.collect());
});

/* 核心的 deleted 事件 */
CORE.on(['articles-deleted', 'article-created', 'article-modified'], () => {
	CORE.getArticles(1);
});

list.on('title-click', articleObj => {
	console.info('title-click', articleObj);
	editor.apply(articleObj);
	CORE.current = articleObj;
	editor.show();
});
list.on('tag-click', tagName => {
	console.info('tag-click', tagName);
});

panel.on('command-del', () => {
	const ids = list.collectCheckedItem().map(item => item._id);
	CORE.removeArticle(ids);
})

list.on('has-checked', () => {
	panel.cmdElement.del.style.display = '';
});
list.on('no-checked', () => {
	panel.cmdElement.del.style.display = 'none';
});

/* 编辑器关闭事件 */
editor.on('editor-hide', () => {
	CORE.current = null;
});

auth.on('success', (authFadeOut) => {
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
