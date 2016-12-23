class PamPanel extends PamEventEmitter {
	bind(ele){
		ele.classList.add('panel');

		let commands = $('.panel > [p-command]', ele.parentNode).filter(commandEle => commandEle.parentNode === ele);

		this.contain = ele;
		this.cmdElement = {};
		this.cmdStatus = {};
		commands.forEach(cmdElement => {
			let cmdName = cmdElement.getAttribute('p-command');
			if (cmdName === null || cmdName.length === 0) {
				console.error(cmdElement);
				throw new Error('元素 p-command 值为空');
			}
			let status = {};
			this.cmdStatus[cmdName] = status;
			this.cmdElement[cmdName] = cmdElement;

			cmdElement.addEventListener('click', (e) => {
				this.emit(`command-${cmdName}`, status, cmdElement, e);
			});
		});
	}
	trigger(cmdName){
		if (this.cmdStatus[cmdName] && this.cmdElement[cmdName]) {
			return this.emit(`command-${cmdName}`, this.cmdStatus[cmdName], this.cmdElement[cmdName], null);
		} else {
			throw new Error(`不存在命令 ${cmdName}`);
		}
	}
}
