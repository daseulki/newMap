const http = require('http');
const fs = require('fs');
//const express = require('express');//웹서버...
//const app = express();
//app.use('/script', express.static(__dirname+"/script"))

const app = http.createServer(function(request,response){
    let url = request.url;
    if(request.url == '/'){
      url = '/index.html';
    }
    if(request.url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + url));

});
app.listen(8080,()=>{
  console.log('app start')
});
