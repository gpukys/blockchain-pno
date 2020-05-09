var express = require('express');
var router = express.Router();
var CryptoBlock = require('../public/models/block.js');
var CryptoBlockchain = require('../public/models/chain.js');
var pnoDb = require('../public/models/mongo.js');
const SHA256 = require('crypto-js/sha256');
const { check, validationResult } = require('express-validator');

const BlockChain = new CryptoBlockchain();

router.post('/create/:id', async function(req, res, next) {
  let database = null;
  return pnoDb.open()
  .then((db)=>{
      database = db;
      return db.db('pno').collections(undefined, function (err, cols) {
        if (err) {
          res.status(500).send();
        }
        if (cols.filter(e => e.collectionName === req.params.id).length > 0) {
          return res.status(400).json({Error: 'Blockchain already exists'});
        } else {
          db.db('pno').createCollection(req.params.id, undefined, function(err, col) {
            if (err) {
              res.status(500).send();
            }
            db.db('pno').collection(col.collectionName).insertOne(new CryptoBlock(0, new Date(), 'Genesis block'), undefined, function(err, suc) {
              database.close();
              res.status(201).send();
            });
          })
        }
      });
  })
  .catch((err)=>{
    res.status(500).send()
  })
})

router.delete('/:id/block/delete/:pno', function(req, res, next) {
  let database = null;
      return pnoDb.open()
      .then((db)=>{
          database = db;
          return db.db('pno').collection(req.params.id)    
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
        console.log(err)
        res.status(500).send();
      })
})

router.get('/:id/block/latest', async function(req, res, next) {
  pnoDb.collectionName = req.params.id;
  const latestBlock = await BlockChain.obtainLatestBlock();
  res.json(latestBlock);
})

router.post('/:id/validate', async function(req, res, next) {
  pnoDb.collectionName = req.params.id;
  await BlockChain.checkChainValidity().then(e => {
    res.send();
  }).catch(err => {
    res.status(422)
    res.send('The blockchain is invalid');
  });
});

router.post('/:id/block/register', [
  check('data').isLength({ min: 11, max: 11}).isNumeric(),
], async function(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send();
  } else {
    pnoDb.collectionName = req.params.id;
    await BlockChain.addNewBlock(new CryptoBlock(0, new Date(), req.body.data));
    res.status(201);
    res.send();
  }
})

router.get('/:id/check/:pno', async function(req, res, next) {
    pnoDb.collectionName = req.params.id;
    const result = await BlockChain.checkIfCointainsData(req.params.pno);
    if (result) {
      res.status(200).send()
    } else {
      res.status(404).send();
    }

})

module.exports = router;
