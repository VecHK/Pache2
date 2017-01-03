function asyncEach(arr, func, end) {
	let cursor = 0;
	const retry = () => {
		--cursor;
		fetch();
	};
	const status = {};
	const fetch = () => {
		if (cursor < arr.length) {
			++cursor;
			func({
				next: fetch,
				retry,
				item: arr[cursor-1],
				cursor,
				arr,
			}, status);
		} else {
			end && end(status);
		}
	};
	fetch();
};
module.exports = asyncEach;
