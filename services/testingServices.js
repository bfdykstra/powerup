
function evalAttributes(a, comparator, b) {
	switch (comparator) {
		case '<':
			return a < b;
		case '>':
			return a > b;
		case '=':
			return a === b;
		case '<=':
			return a <= b;
		case '>=':
			return a >= b;
		case '!=':
			return a !== b;
		default:
			throw Error('The given comparator does not match a known pattern')
	}
}

module.exports = {
	evalAttributes
}