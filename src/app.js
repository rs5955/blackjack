// app.js
const express = require('express');
const app = express();
const path = require('path');
const publicPath = path.resolve(__dirname,"public");
require('./db');
const mongoose = require('mongoose');
const Result = mongoose.model('Result');

app.use(express.static(publicPath));
app.use(express.urlencoded({extended:false}));

//--log requests--
//app.use((req,res,next)=>{
//  console.log('-------------');
//  console.log("Method:",req.method);
//  console.log("Path:",req.path);
//  console.log("Query:",JSON.stringify(req.query));
//  console.log('-------------');
//  next();
//});

app.get('/api/results',(req,res)=>{
//  console.log('GET api/results');
  Result.find().exec((err,output)=>{
    const toAdd=[];
    let i = output.length-1;
    //get at most 5 of the latest entries
    while(i>=0 && i>=output.length-5){
      toAdd.push(output[i]);
      i--;
    }
    res.json(toAdd);
  });
});

app.post('/api/results',(req,res)=>{
//  console.log('POST api/results');
  const result = new Result({
    computer: req.body.computer,
    player: req.body.player,
    initials: req.body.initials, 
  });
  result.save((err,output)=>{
    res.json(output);
  });
});

app.listen(3000);