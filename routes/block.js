var express = require('express');
var router = express.Router();
var CryptoBlock = require('../public/models/block.js');
var CryptoBlockchain = require('../public/models/chain.js');
const { check, validationResult } = require('express-validator');

const BlockChain = new CryptoBlockchain();

router.get('/latest', async function(req, res, next) {
  const latestBlock = await BlockChain.obtainLatestBlock();
  res.json(latestBlock);
})

router.get('/validate', async function(req, res, next) {
  await BlockChain.checkChainValidity().then(e => {
    res.send();
  }).catch(err => {
    res.status(422)
    res.send('The blockchain is invalid');
  });
});

router.post('/register', [
  check('data').isLength({ min: 11, max: 11}).isNumeric(),
], async function(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send();
  } else {
    await BlockChain.addNewBlock(new CryptoBlock(0, new Date(), req.body.data));
    res.status(201);
    res.send();
  }
})

module.exports = router;
