const express = require('express');
const path = require('path')
const port = process.env.PORT || 3000;
const EventEmitter = require('events');
const chatEmitter = new EventEmitter();


const app = express();
app.use(express.static(__dirname + '/public'));

function respondText(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hi');
  }

function respondJson(req ,res){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ text: 'hi', numbers: [1, 2, 3] }));
  
}

function respondEcho(req, res) {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const input = urlObj.searchParams.get('input') || '';

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        normal: input,
        shouty: input.toUpperCase(),
        charCount: input.length,
        backwards: input.split('').reverse().join(''),
    }));
}
  

function chatapp(req,res){
    res.sendFile(path.join(__dirname, '/chat.html'));
}


function respondChat (req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}


function respondSSE (req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
    });
  
    const onMessage = message => res.write(`data: ${message}\n\n`); 
       chatEmitter.on('message', onMessage);
  
    res.on('close', () => {
      chatEmitter.off('message', onMessage);
    });
  }

app.get('/', chatapp);
app.get('/chat', respondChat);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/sse', respondSSE);


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});