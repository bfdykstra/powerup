const randomInt = require('random-int');
const randomFloat = require('random-float');

function evalAttribute(a, comparator, b) {
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
            throw Error(`The given comparator: ${comparator}, does not match a known pattern`)
    }
}

// test if a user meets a single attribute
function isEligible(user, attribute) {
    const { property, val, rule } = attribute
    return evalAttribute(user[property], rule, val )
}

// test whether a given user meets all the attributes given
function testUserAttributes(user, testAttributes){
    // allEligible will be the same length as the testAttribute array
    // if given user meets all attributes
    const allEligible = testAttributes.filter(attr => isEligible(user, attr))
    return testAttributes.length === allEligible.length
}

function getEligibleUsers(users, requiredAttributes){
    // requiredAttributes is an array where users need
    // to match
    return users.filter(user => testUserAttributes(user, requiredAttributes))
}


/*
Get an n sized array of user objects. Kind of mocks a db call.
id would be primary key
User object:
{
	id: int,
	age: int,
	n_credit_cards: int,
	fico_score: int,
	credit_line: int,
	credit_apr: float
}

*/
function generateUsers(n) {
	const users = []
	for(let i = 0; i < n; i++){
		users.push({
			id: i,
			age: randomInt(18, 50),
			n_credit_cards: randomInt(0, 5),
			fico_score: randomInt(500, 800),
			credit_line: randomInt(500, 15000),
			credit_apr: randomFloat(0.1,0.3)
		})
	}

	return users;
}


module.exports = {
	generateUsers,
	getEligibleUsers,
	evalAttribute
}


