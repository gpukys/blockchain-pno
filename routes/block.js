var express = require('express');
var router = express.Router();
var CryptoBlock = require('../public/models/block.js');
var CryptoBlockchain = require('../public/models/chain.js');
var pnoDb = require('../public/models/mongo.js');
const { check, validationResult } = require('express-validator');
const SHA256 = require('crypto-js/sha256');

const BlockChain = new CryptoBlockchain();

router.get('/latest', async function(req, res, next) {
  const latestBlock = await BlockChain.obtainLatestBlock();
  res.json(latestBlock);
})

router.post('/validate', async function(req, res, next) {
  await BlockChain.checkChainValidity().then(e => {
    res.send();
  }).catch(err => {
    res.status(422)
    res.send('The blockchain is invalid');
  });
});

router.delete('/delete/:pno', function(req, res, next) {
  let database = null;
      return pnoDb.open()
      .then((db)=>{
          database = db;
          return db.db('pno').collection('pno')    
      })
      .then((pno)=>{
          return pno.deleteOne({data: SHA256(req.params.pno).toString()});
      })
      .then((result)=>{
          database.close();
          res.send();
          return result;
      })
      .catch((err)=>{
        res.status(500).send();
      })
})

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

router.get('/check/:pno', async function(req, res, next) {
  if (req.params.pno) {
    const result = await BlockChain.checkIfCointainsData(req.params.pno);
    if (result) {
      res.status(200).send()
    } else {
      res.status(404).send();
    }
  } else {
    res.status(404).send();
  }
})

module.exports = router;
