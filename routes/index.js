const express = require('express');
const router = express.Router();
const { assignUsers } = require('../services/testingServices');
const { generateUsers } = require('../services/userServices');
const logger = require('../services/logger');

const testDefFile = '../test_definitions.json'
const testDefs = require(testDefFile);

/* GET tests with users assigned */
router.get('/', (req, res, next) => {

  const { n_users } = req.query;
  
  if (!n_users ) {
    res.status(422).json({"error": "Please provide the number of users you would like as a query parameter in 'n_users'"})
  } else if( n_users <= 0) {
    res.status(422).json({ "error": "Please provide a number of users greater than 0" })
  } else {
    logger.info(`Generating ${n_users} users...`)
    try {
      const users = generateUsers(n_users); // this could be replaced with a db call

      logger.info('Assigning ', n_users, ' users to test definitions from file: ', testDefFile) // just illustrating different uses of logger
      const testGroups = assignUsers(testDefs, users)
      res.status(200).json(testGroups)
    } catch (e) {
      const error = `There was an error assigning the users: ${e.message}`
      res.status(500).json({ error })
    }
    
  }

  
});

module.exports = router;
