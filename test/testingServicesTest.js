const assert = require('assert');
const { 
    segmentTests,
    testOverlapping,
    testSameProps
} = require('../services/testingServices')
const testDefs = require('../test_definitions.json');

describe('Functional tests for testingServices module', () => {

  describe('test overlap function', () => {

      describe('given two tests where a start date overlaps with an active period', () => {
          it(' should return true', () => {
              assert.equal(true, testOverlapping({startDate: "2019-07-01", endDate: "2019-12-31"}, { startDate: "2019-11-31"}))
          });
      });

      describe('given two tests where start date outside of active period', () => {
          it('should return false', () => {
              assert.equal(false, testOverlapping({startDate: "2019-07-01", endDate: "2019-12-31"}, { startDate: "2018-11-31"}))
          });
      });  
  });


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
        };
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
        };
        it('should return true', () => {
          assert.equal(true, testSameProps(a, b))
        });
    });


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
      };
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
      };

      it('should return false', () => {
        assert.equal(false, testSameProps(a,b));
      });
    });
  });


  describe('Segment the tests', () => {
    segmented = segmentTests(testDefs);
    segmented.forEach((testGroup) => {
      describe(`within a test group (${testGroup.map(g => g.testName)})`, () => {
        // need to compare every test in a group to each other
        for(let i = 0; i <  testGroup.length; i++) {
          for(let j = i + 1; j < testGroup.length; j++) {
            if (testGroup.length > 1) {
              if(testOverlapping(testGroup[i], testGroup[j])) {
                it('if tests overlap, should not test same properties', () => {
                  assert.equal(false, testSameProps(testGroup[i], testGroup[j]));
                });
              }
            }
          }
        }
      });
    });
  });
});
