const CORE = new Pam;
CORE.start();

const auth = new PamAuth;
const panel = new PamPanel;
const list = new PamList;
const page = new PamPage;
page.start();
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

/* 核心 modified 事件 */
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
	$$('main').style.opacity = 1;
	CORE.current = null;
});
/* 编辑器打开事件 */
editor.on('editor-show', () => {
	$$('main').style.opacity = 0;
})

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
page.on('click', pageCode => {
	CORE.getArticles(pageCode);
});
CORE.on('get-articles', obj => {
	console.info(obj);
	page.maxPage = Math.ceil(obj.count / obj.limit);
	page.set(obj.page);
	list.render(obj.list);
});

CORE.on('logout', e => {
	auth.show();
})
panel.on('command-logout', e => {
	CORE.logout();
})
