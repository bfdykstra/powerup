const express = require('express');
const router = express.Router();
const { assignUsers } = require('../services/testingServices');
const { generateUsers } = require('../services/userServices');
const logger = require('../services/logger');

const testDefFile = '../test_definitions.json'
const testDefs = require(testDefFile);


router.get('/', (req, res) => {
  res.send("Hey ( ͡° ͜ʖ ͡°), glad you're here! Navigate to localhost:3000/testsWithUsers?numUsers=5000 to really let this thing rip. Or replace 5000 with any number that you please.")
})


/* GET tests with users assigned */
router.get('/testsWithUsers', (req, res, next) => {

  const { numUsers } = req.query;

  // this validation is my least favorite part of the code, would like to 
  // use some express middleware eg express-validator to validate the params

  const nUsers = parseInt(numUsers); // will convert floor a float to an int
  
  // check if they have provided a param, if they have that it is a number and an int
  if (!nUsers || (typeof nUsers !== "number") || (nUsers % 1 !== 0) ) {
    logger.error('bad parameter: ', nUsers);
    res.status(422).json({"error": "Please provide the number of users as an integer that you would like as a query parameter in 'nUsers'"})
  } else if( nUsers <= 0) {
    res.status(422).json({ "error": "Please provide a number of users greater than 0" })
  } else {
    logger.info(`Generating ${nUsers} users...`)
    try {
      const users = generateUsers(nUsers); // this could be replaced with a db call

      logger.info('Assigning ', nUsers, ' users to test definitions from file: ', testDefFile) // just illustrating different uses of logger

      const testGroups = assignUsers(testDefs, users)
      res.status(200).json(testGroups)
    } catch (e) {
      const error = `There was an error assigning the users: ${e.message}`
      res.status(500).json({ error })
    }
    
  }

  
});

module.exports = router;
