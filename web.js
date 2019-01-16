var gzippo = require('gzippo');
var express = require('express');
var morgan = require('morgan');
var app = express();

//app.use(morgan('dev'));
//app.use(gzippo.staticGzip("" + __dirname + "/dist"));

app.use(express.static('dist/'));

app.use(function(req, res) { 
	res.sendfile("" + __dirname + "/dist/index.html"); 
}); 

app.listen(process.env.PORT || 5000);