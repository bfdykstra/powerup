const assert = require('assert');
const { 
    assignUsers,
    testOverlapping,
    testSameProps
} = require('../services/testingServices');
const { evalAttribute } = require('../services/userServices');
const testDefs = require('../test_definitions.json');
const users = require('../testData/users.json');

describe('Powerup assessment', () => {
    

  describe('Assigning users to tests', () => {
    const assignedUsers = assignUsers(testDefs, users);
    assignedUsers.forEach((test) => {
      const { users } = test;

      describe(`${test.testName} requirements`, () => {
        test.requiredAttributes.forEach(({property, val, rule }) => {

          it(`Users ${property} should be ${rule} ${val}`, () => {
            // the users assigned to the test
            const filtered = users.filter(user => evalAttribute(user[property], rule, val))
            assert.equal(filtered.length, test.users.length)
          })
        })

        describe('A user cannot be assigned the same test more than once', () => {
          // all user ids should be unique
          const ids = users.map(user => user.id)

          it('within a test, all user ids should be unique', () => {
            assert.equal(ids.length, new Set(ids).size)
          })
        })
      })
    })


    describe('A user cannot be assigned to two tests which test the same property AND are both active', () => {
      for(let i = 0; i < assignedUsers.length; i++){
        for(let j = i + 1; j < assignedUsers.length; j++){
          if(testOverlapping(assignedUsers[i], assignedUsers[j]) && testSameProps(assignedUsers[i], assignedUsers[j])) {
            const usersInA = new Set(assignedUsers[i].users.map(user => user.id))
            const usersInB = new Set(assignedUsers[j].users.map(user => user.id))
            const intersection = [...usersInA].filter(x => usersInB.has(x))
            
            it('No users should be assigned to both tests', () => {
              assert.equal(0, intersection.length)
            });
          }
        }
      }
    });
  });
});

