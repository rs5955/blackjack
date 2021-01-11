const mongoose = require('mongoose');
//computer score, user score, user initials
//display last 5 hands
const Result = new mongoose.Schema({
  computer: Number,
  player: Number,
  initials: String,
});

mongoose.model('Result',Result);

// is the environment variable, NODE_ENV, set to PRODUCTION?
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
  // if we're in PRODUCTION mode, then read the configration from a file
  // use blocking file io to do this...
  const fs = require('fs');
  const path = require('path');
  const fn = path.join(__dirname, '../config.json');
  const data = fs.readFileSync(fn);

  // our configuration file will be in json, so parse it and set the
  // conenction string appropriately!
  const conf = JSON.parse(data);
  dbconf = conf.dbconf;
} else {
  // if we're not in PRODUCTION mode, then use
  dbconf = 'mongodb://localhost/blackjack';
}

mongoose.connect(dbconf,{useNewUrlParser: true, useUnifiedTopology: true});
