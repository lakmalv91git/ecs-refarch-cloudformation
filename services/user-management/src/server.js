// server.js
const express = require('express')
var morgan = require("morgan");
const app = express()
var request = require('request');
const ALB_HOST = process.env.ALB_host;
const util = require('util')

//app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());

// You can set morgan to log differently depending on your environment
if (app.get('env') == 'production') {
    app.use(morgan('common', { skip: function (req, res) { return res.statusCode < 400 }, stream: __dirname + '/../morgan.log' }));
} else {
    app.use(morgan('dev'));
}

app.listen(3001, () => {
    console.log('listening on 3001')
})

app.get('/usermanagement/health', (req, res) => {
    res.sendStatus(200);
})

app.post('/usermanagement/saveuser', (req, res) => {
    request.post('http://' + ALB_HOST + '/masterdata/saveuser',
        { json: { name: req.body.name, age: req.body.age } },
        function (error, response, body) {
            if (error) return console.log(util.inspect(error))
            res.setHeader('Content-Type', 'application/json');
            res.send(body);
        }
    );
})

app.get('/usermanagement/showuser', (req, res) => {
    request.get('http://' + ALB_HOST + '/masterdata/showuser', function (error, response, body) {

        if (error) return console.log(util.inspect(error))
        res.setHeader('Content-Type', 'application/json');
        res.send(body);
    }
    );
})

app.get('/usermanagement/averageageuser', (req, res) => {
    request.get('http://' + ALB_HOST + '/masterdata/averageageuser', function (error, response, body) {

        if (error) return console.log(util.inspect(error))
        res.setHeader('Content-Type', 'application/json');
        res.send(body);
    }
    );
})

