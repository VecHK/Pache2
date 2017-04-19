const MiddleHook = fn => {
	return async function (next) {
		try { await fn.call(this) }
		catch (err) { return next(err) }
		next()
	}
}

module.exports = MiddleHook
