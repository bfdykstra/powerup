const assert = require('assert');
const {
  getEligibleUsers,
  generateUsers,
  evalAttribute
} = require('../services/userServices');
const users = require('../testData/users.json');


describe('Functional tests for userServices', () => {

  describe('evalAttribute function', () => {

    it('should return true for 1 < 2', () => {
      assert.equal(true, evalAttribute(1, '<', 2));
    });

    it('should return false for 1 > 2', () => {
      assert.equal(false, evalAttribute(1, '>', 2));
    });

    it('should return true for 1 <= 2', () => {
      assert.equal(true, evalAttribute(1, '<=', 2));
    });

    it('should return false for 1 >= 2', () => {
      assert.equal(false, evalAttribute(1, '>=', 2));
    });

    it('should return true for 1 = 1', () => {
      assert.equal(true, evalAttribute(1, '=', 1));
    });

    it('should return false for 1 = 2', () => {
      assert.equal(false, evalAttribute(1, '=', 2));
    });

    it('should return true for 1 != 2', () => {
      assert.equal(true, evalAttribute(1, '!=', 2));
    });

    it('should throw an error if given an unrecognized symbol', () => {
      try {
        evalAttribute(1, 'b', 2);
      } catch (e) {
        assert.equal('The given comparator: b, does not match a known pattern', e.message);
      }
    });

    it('should throw an error if the input is not numeric', () => {
      try {
        evalAttribute('a', '<', 2);
      } catch (e) {
        assert.equal('Input must be numeric', e.message);
      }
    });

  });

  describe('generateUsers function', () => {
    const userArr = generateUsers(5);

    it('should return an array of the given length', () => {
      assert.equal(5, userArr.length)
    });

  });

  describe('getEligibleUsers function', () => {

    describe('given an array of user attributes', () => {

      const userAttributes = [
        {
          "property": "age",
          "val": 30,
          "rule": "<"
        },
        {
          "property": "n_credit_cards",
          "val": 0,
          "rule": "="
        }
      ];

      const eligible = getEligibleUsers(users, userAttributes);

      userAttributes.forEach(({property, val, rule }) => {

        it(`All eligble users ${property} should be ${rule} ${val}`, () => {
          // the users assigned to the test
          const filtered = eligible.filter(user => evalAttribute(user[property], rule, val));
          assert.equal(filtered.length, eligible.length);
        });

      });

    });
  });
});
