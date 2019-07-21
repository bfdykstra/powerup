/*

Module for orchestrating tests

Test object:
  testName: string, the name of the test
  testStatus: string, a user defined status of the test (e.g. created and pending approval, active, stopped)
  startDate: string, yyyy-mm-dd format. the date when users should begin to be assigned to the test
  endDate: string, yyyy-mm-dd format. the date when users should stop being assigned to the test
  treatments: array of treatment objects
    treatmentName: string, the name of the treatment
    numSamples: int, the maximum number of users that should be placed into the treatment
    properties: Object, the properties that are affected by this treatment, this can be any arbitrary key-pair
  requiredAttributes: This is a list of required attributes that the user must have.
    property: string, a property of a user such as age
    val: any, the value that the property is compared against
    rule: string, valid values are: '<', '>', '=', '<=', '>=', or '!='. The rule that a user assigned to this test should meet.
    example: Age less than 30 years old would be {"property": "age", "val": 30, "rule": "<"}

*/

const { 
    generateUsers,
    getEligibleUsers
} = require('./userServices')


/*
  Takes a 1-d or 2-d array and flattens it, since array.flat() is still experimental -.-
*/
function flatten(arr) {
  return arr.reduce((acc, val) => acc.concat(val), [])
}


/*
  Given a string in yyyy-mm-dd format, return Date object
*/
function parseDate(yyyymmdd){
  const [year, month, day] = yyyymmdd.split('-')
  return new Date(`${month}-${day}-${year}`)
}


/*
  Given two Test objects, testA and testB,
  return true if testB.start date falls within testA's active period
*/
function testOverlapping(testA, testB){

  const begin = parseDate(testA.startDate)
  const end = parseDate(testA.endDate)
  const test = parseDate(testB.startDate)

  return (test > begin && test < end)
}


/*
  Given a test object, 
  Return a Set of properties that are tested in the treatments
*/
function getTestProperties(test) {
    return new Set(flatten(test.treatments.map(treatment => Object.keys(treatment.properties))))
}


/*
  Given two Test objects, testA and testB,
  return true if the treatments test any of the same properties
*/
function testSameProps(testA, testB){
    const propsA = getTestProperties(testA)
    const propsB = getTestProperties(testB)
    const combined = new Set([...propsA].filter(prop => propsB.has(prop))) // intersection
    // if the interesection of the properties is the same size as the set of properties, they are all the same
    return combined.size === propsA.size
}


/*
  Given an array of Test objects,
  Split up the test array in to sub arrays such that within a subarray either:
   a) The treatments test different properties
   OR
   b) If they do treat the same properties, the test time periods do not overlap

  By splitting up the tests like this, we ensure that a user cannot be assigned 
  two tests that are both active and test the same property

*/
function segmentTests(testArray) {
    const segmented = [];
    for (let i = 0; i < testArray.length; i++){

        const playNice = []
        if (!testArray[i].added) playNice.push(testArray[i])
        for (let j = i + 1; j < testArray.length; j++){
            const testA = testArray[i];
            const testB = testArray[j];
            const overlap = testOverlapping(testA, testB);
            const sameProps = testSameProps(testA, testB);
            // if tests dont have same props, push
            if (!sameProps && !testB.added) {
                playNice.push(testB)
                testB.added = true
            } else {
                // else they affect same properties, cannot overlap
                if (!overlap && !testB.added) {
                    playNice.push(testB)
                    testB.added = true
                }
            }
        }
        // check if any of the tests in playNice are already in the
        // segmented array
        if (playNice.length) segmented.push(playNice)
    }
    
    testArray.forEach(test => delete test.added);

    return segmented
}


/*
  Given two arrays of user objects, 
  return an array of assignedUsers removed from the originaluser array. (it's set difference)
*/
function removeUsers(originalUsers, assignedUsers) {
    const assignedIds = new Set(assignedUsers.map(({ id }) => id));
    // return array that does not have any ids that are in assigned users
    return originalUsers.filter(({ id }) => !assignedIds.has(id))
}


/*
  Given an array of tests, and an array of users,
  Assign the users to testing groups such that:
    1. A user is never assigned to the same test more than once
    2. A user is not in two tests that are both active and that both affect the same properties
    3. A user attributes meet the test criterion, the user is assigned to the test.
  
  Returns an array of test objects with a user field added on that has an array of users that
  have been assigned to that test.
*/
function assignUsers(tests, users) {
    const segmented = segmentTests(tests)
    let userPool = users
    let found = []
    const groups = []
    segmented.forEach((testSet) => {
        
        testSet.forEach((test) => {
            const eligibleUsers = getEligibleUsers(userPool, test.requiredAttributes)
            found = found.concat(eligibleUsers)
            // console.log('eligible: ', eligibleUsers);
            groups.push({
                users: eligibleUsers,
                ...test
            })

        })
        
        userPool = removeUsers(userPool, found); // remove found users from userPool
        
    })
    
    return groups

}

module.exports = {
    assignUsers,
    segmentTests,
    testOverlapping,
    testSameProps
}




