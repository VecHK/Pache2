(function () {
	const trueOrFalse = () => Math.round(Math.random()),
		backCode = () => 65 + Math.round(Math.random() * 25),
		randomChar = (lower = 0) => String.fromCharCode(backCode() + (lower && 32)),
		randomString = (length, lower = 0) => randomChar(lower && trueOrFalse()) + (--length ? randomString(length, lower) : '');

	try {
		module.exports = randomString
	} catch (e) {
		window.randomString = randomString
	}
})()
