var express = require('express');
var router = express.Router();
var pnoDb = require('../public/models/mongo.js')
var CryptoBlock = require('../public/models/block.js');
var CryptoBlockchain = require('../public/models/chain.js');

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

router.post('/register', async function(req, res, next) {
  await BlockChain.addNewBlock(new CryptoBlock(0, new Date(), '39711140150'));
  res.status(201);
  res.send();
})

module.exports = router;
