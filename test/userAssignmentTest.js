const assert = require('assert');
const { 
    assignUsers,
    segmentTests,
    testOverlapping,
    testSameProps
} = require('../services/testingServices')
const { evalAttribute } = require('../services/userServices')
const testDefs = require('../test_definitions.json')
const users = require('../testData/users.json')

describe('Powerup assessment', () => {
    describe('test overlap function', () => {
        describe('given two tests where a start date overlaps with an active period', () => {
            it(' should return true', () => {
                assert.equal(true, testOverlapping({startDate: "2019-07-01", endDate: "2019-12-31"}, { startDate: "2019-11-31"}))
            })
        })
        describe('given two tests where start date outside of active period', () => {
            it('should return false', () => {
                assert.equal(false, testOverlapping({startDate: "2019-07-01", endDate: "2019-12-31"}, { startDate: "2018-11-31"}))
            })
        })
        
    })
    describe('testSameProps function', () => {
        describe('Given two tests whose treatments test same properties', () =>{
            const a = {
                treatments: [
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    },
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    }
                ]
            }
            const b = {
                treatments: [
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    },
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    }
                ]
            }
            it('should return true', () => {
                assert.equal(true, testSameProps(a, b))
            })
        })

        describe('Given two tests whose treatments test different properties', () => {
            const a = {
                treatments: [
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    },
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2,
                            "diff": 3
                        }
                    }
                ]
            }
            const b = {
                treatments: [
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    },
                    {
                        properties: {
                            "aProp": 1,
                            "bProp": 2
                        }
                    }
                ]
            }
            it('should return false', () => {
                assert.equal(false, testSameProps(a,b))
            })
        })
    })
    describe('Segment the tests', () => {
        segmented = segmentTests(testDefs)
        segmented.forEach((testGroup) => {
            describe('within a test group', () => {
                // need to compare every test in a group to each other
                for(let i = 0; i <  testGroup.length; i++) {
                    for(let j = i + 1; j < testGroup.length; j++) {
                        it('if tests overlap, should not test same properties', () => {
                            if (testGroup.length > 1){
                                if(testOverlapping(testGroup[i], testGroup[j])) {
                                    assert.equal(false, testSameProps(testGroup[i], testGroup[j]))
                                }
                            }
                        })
                    }
                }
                
                
            })
        })
    })

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
                        })
                    }
                }
            }
        })
    })
})

