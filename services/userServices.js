/*
	Module for performing actions on User objects
  User object:
  {
    id: int, primary key
    age: int, the age of the user
    n_credit_cards: int, the number of credit cards that the user has
    fico_score: int, credit score
    credit_line: int, the users line of credit
    credit_apr: float, the interest rate
  }
*/
const randomInt = require('random-int');
const randomFloat = require('random-float');


/*
  Given 'a' value, a comparator, and 'b' value:
  Valid values for comparator are '<', '>', '=', '<=', '>=', or '!='
  Return 'a' compared to 'b'.
  Ex: evalAttribute(1, '<', 2) => true
*/
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


/*
  Given a user object, and a user test attribute object,
  return true if the user object meets the attributes specifications
*/
function isEligible(user, attribute) {
    const { property, val, rule } = attribute
    return evalAttribute(user[property], rule, val )
}


/*
  Given a user object and an array of test attributes,
  return true if the given user meets ALL the attributes given
*/
function testUserAttributes(user, testAttributes){
    // allEligible will be the same length as the testAttribute array
    // if given user meets all attributes
    const allEligible = testAttributes.filter(attr => isEligible(user, attr))
    return testAttributes.length === allEligible.length
}


/*
  Given an array of users and an array of required test attributes,
  return an array of users that meet the given attributes
*/
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


