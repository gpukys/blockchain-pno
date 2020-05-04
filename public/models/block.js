const SHA256 = require('crypto-js/sha256');
module.exports = class CryptoBlock{
    constructor(index, timestamp, data, precedingHash=" "){
     this.index = index;
     this.timestamp = timestamp;
     this.data = SHA256(data).toString();
     this.precedingHash = precedingHash;
     this.hash = this.computeHash();     
    }
    computeHash(){
        return SHA256(this.index + this.precedingHash + this.timestamp + JSON.stringify(this.data)).toString();
    }   
}