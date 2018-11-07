const http = require('http');
const fs = require('fs');

//const express = require('express');//웹서버...
//const app = express();
//app.use('/script', express.static(__dirname+"/script"))
let script;
let map = fs.readFile('map.js','utf-8',(err,body)=>{
  script = body;
})

const app = http.createServer(function(request,response){
    let url = request.url;
    let css = request.url;

    if(request.url == '/'){
      console.log(`call html`);
      url = '/index.html';

    }
    if(request.url == '/favicon.ico'){
      console.log(`/favicon.ico`);
      return response.writeHead(404);
    }
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + url));

});
app.listen(8080,()=>{
  console.log('app start')

});
