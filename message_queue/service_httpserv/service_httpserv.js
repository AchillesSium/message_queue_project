const http = require('http');
var fs = require('fs');

const hostname = '0.0.0.0';
const port = 3000;

http.createServer((req, res) => {
    fs.readFile('app/data.txt', function(error, data) {
      if (error) throw error;
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(data);
        res.end();
      });
}).listen(port, hostname); //returning response
