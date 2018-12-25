// server.js
const express = require('express')
var morgan = require("morgan");
var util = require('util');
const app = express()
const MongoClient = require('mongodb').MongoClient

var RedisClustr = require('redis-clustr');
var RedisClient = require('redis');

const RedisHost = process.env.RedisHost;
const RedisPort = process.env.RedisPort;


var redis = new RedisClustr({
    servers: [
        {
            host: RedisHost,
            port: RedisPort
        }
    ],
    createClient: function (port, host) {
        // this is the default behaviour
        return RedisClient.createClient(port, host);
    }
});

// var redis = new RedisClustr({
//     servers: [
//         {
//             host: 'ner16afv2hzp00rw.dw18jg.ng.0001.euw1.cache.amazonaws.com',
//             port: '6379'
//         }
//     ],
//     createClient: function (port, host) {
//         // this is the default behaviour
//         return RedisClient.createClient(port, host);
//     }
// });

//connect to redis
redis.on("connect", function () {
    console.log("ElastiCache Redis cluster connected");
});


app.use(express.json());

// You can set morgan to log differently depending on your environment
if (app.get('env') == 'production') {
    app.use(morgan('common', { skip: function (req, res) { return res.statusCode < 400 }, stream: __dirname + '/../morgan.log' }));
} else {
    app.use(morgan('dev'));
}

var db
MongoClient.connect('mongodb://lakmal:lakmal1@ds115434.mlab.com:15434/bda_cloud_test', (err, client) => {
    if (err) return console.log(util.inspect(err))
    db = client.db('bda_cloud_test') // whatever your database name is
    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

app.get('/masterdata/health', (req, res) => {
    res.sendStatus(200);
})

app.post('/masterdata/saveuser', (req, res) => {
    // console.log("req.body " + req.body);
    // console.log("req.body.name " + req.body.name);
    db.collection('user').save({ name: req.body.name, age: req.body.age }, (err, result) => {
        if (err) return console.log(util.inspect(err))
        console.log('saved to database')
        res.sendStatus(200);
    })
})

app.get('/masterdata/showuser', (req, res) => {
    db.collection('user').find().toArray(function (err, results) {
        if (err) return console.log(util.inspect(err))
        res.send(results)
    })
})
app.get('/masterdata/averageageuser', (req, res) => {

    redis.get("users", function (err, reply) {
        var count = 0;
        var total = 0.0;
        if (err) {
            db.collection('user').find().toArray(function (err, results) {
                redis.set("users", results, function (err, replySet) {
                    console.log("redis.set ", replySet);
                });

                for (let element of results) {
                    var age = element.age;

                    if (age != null) {
                        count++;
                        total = total + age;

                    }
                }
                console.log('count' + count);
                console.log('total' + total);
                var average = total / count;
                res.send("result " + average);

            })
        } else {
            for (let element of reply) {
                var age = element.age;

                if (age != null) {
                    count++;
                    total = total + age;

                }
            }
            console.log('count' + count);
            console.log('total' + total);
            var average = total / count;
            res.send("result " + average);
        }
    });
})

