require('dotenv').config();
const server_port = process.env.PORT || 3000;

const fs = require('fs');
const path = require('path');
const cors = require('cors')

var request = require("request");
var morgan = require('morgan')

const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const clients = [];


app.get('/', (req, res) => {
    req.send('Hello world');
})


app.post('/commit', (req, res) => {
    console.log(req.body)
    console.log(req.body)
    // {
    // 'account length': req.body.length,
    // 'number vmail messages': '1',
    // 'total day minutes': '1',
    // 'total day calls': '1',
    // 'total day charge': '1',
    // 'total eve minutes': '1',
    // 'total eve calls': '1',
    // 'total eve charge': '1',
    // 'total night minutes': '1',
    // 'total night calls': '1',
    // 'total night charge': '1',
    // 'total intl minutes': '1',
    // 'total intl calls': '1',
    // 'total intl charge': '1',
    // 'customer service calls': req.body.calls,
    // churn: 'false',
    // lat: req.body.lat,
    // long: req.body.long
    // }

    const options = {
        method: 'POST',
        url: 'https://ussouthcentral.services.azureml.net/workspaces/22baaa55d81b43fbae6d10a81e886417/services/09db1383f37742c89c8cca840a088a32/execute',
        qs: { 'api-version': '2.0', format: 'swagger' },
        headers:
        {
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
            Authorization: 'Bearer /Lqert59msuavyqNj90dKgFZdCSBwR1/lAYWcmAsY8io/mH2NmVooyIMQdldstARSMJ7zfxL65Jc8MFj/c6lCw=='
        },
        body:
        {
            Inputs:
            {
                input1:
                    [{
                        ...req.body
                    }]
            },
            GlobalParameters: {}
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        res.send(body);
        const result = body.Results.output1[0];
        console.log(result)
        if (result['Scored Labels'] == "True" || result['Scored Labels'] === true)
            for (var i in clients) {
                clients[i].emit('update', {
                    lat: result.lat,
                    long: result.long
                });
            }
    });
});

io.on('connection', client => {
    console.log('Client connected');
    clients.push(client);
    client.on('disconnect', () => {
        //remove client from clients array
        console.log('Client disconnected')
    });

});

server.listen(server_port, () => {
    console.log('App listening');
});