var mongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017/?compressors=zlib&gssapiServiceName=mongodb";


function open(){
  // Connection URL. This is where your mongodb server is running.
  return new Promise((resolve, reject)=>{
    // Use connect method to connect to the Server
    mongoClient.connect(uri, (err, db) => {
        if (err) {
            reject(err);
        } else {
            resolve(db);
        }
    });
  });
}

function close(db){
  //Close connection
  if(db){
      db.close();
  }
}

let db = {
  collectionName: undefined,
  open : open,
  close: close
}

module.exports = db;