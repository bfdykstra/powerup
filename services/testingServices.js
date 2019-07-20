
const { generateUsers, getEligibleUsers } = require('./userServices')
/*

Module for utilities having to do with orchestrating the
tests themselves.

*/



// array.flat() is still experimental -.-
function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), [])
}

// convert time stamp to something js likes
function parseDate(yyyymmdd){
    const [year, month, day] = yyyymmdd.split('-')
    return new Date(`${month}-${day}-${year}`)
}

// check if testB start date overlaps with testA active period
function testOverlapping(testA, testB){

    const begin = parseDate(testA.startDate)
    const end = parseDate(testA.endDate)
    const test = parseDate(testB.startDate)

    return (test > begin && test < end)
}

// Given a test object, get the properties that are tested in the treatments
function getTestProperties(test) {
    return new Set(flatten(test.treatments.map(treatment => Object.keys(treatment.properties))))
}

function testSameProps(testA, testB){
    const propsA = getTestProperties(testA)
    const propsB = getTestProperties(testB)
    const combined = new Set([...propsA].filter(prop => propsB.has(prop))) // intersection
    // if the interesection of the properties is the same size as the set of properties, they are all the same
    return combined.size === propsA.size
}

/*
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

function removeUsers(originalUsers, assignedUsers) {
    const assignedIds = new Set(assignedUsers.map(({ id }) => id));
    // return array that does not have any ids that are in assigned users
    return originalUsers.filter(({ id }) => !assignedIds.has(id))
}

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




