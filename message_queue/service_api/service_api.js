const express = require('express');
const app = express();
const http = require('http');
const amqp = require('amqplib/callback_api');
const store = require('store');
const fs = require('fs');

// creating data.txt file to store the status
fs.writeFile('data.txt', '', function (err) {
    if (err) throw err;
    console.log('File has been created!');
});


// api gateway interface
app.get("/", (req, res, next) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.createReadStream('index.html').pipe(res);
});

// GET/messages api
app.get("/messages", (req, res, next) => {
    // Read data 
    http.get('http://service_httpserv:3000', (response) => {
        let data = '';
        // data received
        response.on('data', (chunk) => {
            data += chunk;
        });
        // reponse received
        response.on('end', () => {
            res.write(data.toString());
            res.end();
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    }).end();
});

// PUT/state api
app.put("/state", (req, res) => {
    // store the status
    const msg = req.query.data;
    store.set("status", req.query.data);

    const d = new Date();
    const n = d.toISOString();
    let newtext = "";
    //Init store log for both init and running
    if (msg === "INIT") {
        newtext = `${n}: ${msg} \n${n}: RUNNING \n`;
    }
    else {
        newtext = `${n}: ${msg} \n`;
    }
    // write messages on data.txt
    fs.appendFile('data.txt', newtext, function (err) {
        if (err) throw err;
        console.log('Saved!', newtext);
    });

    // connect to rabbitmq
    amqp.connect('amqp://guest:guest@rabbitmq:5672', (err, conn) => {
        if (err) {
            console.log(`Error ${err}`);
        }

        conn.createChannel((error, channel) => {
            if (error) {
                console.log(`Error ${err}`);
            }
            const exchange = 'topic_state';
            const key = 'my.state';
            const msg = req.query.data;

            channel.assertExchange(exchange, 'topic', {
                durable: false
            });
            // send pause message to orginal
            channel.publish(exchange, key, Buffer.from(msg));
            console.log(" [x] Sent %s:%s", key, msg);
        });
    });
    res.write("PUT /state called");
    res.end();
});

// GET/state api
app.get("/state", (req, res, next) => {
    // Read the state 
    const status = store.get("status") ? store.get("status") : "RUNNING";
    res.write(status);
    res.end();
});

// GET/run-log api
app.get("/run-log", (req, res, next) => {
    // Read logs from data.txt
    fs.readFile('data.txt', function (err, data) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(data);
        res.end();
    });
});

// GET/node-statistic api
app.get("/node-statistic", (req, res, next) => {
    // Read logs from rabbitmq api
    http.get('http://guest:guest@rabbitmq:15672/api/nodes', (resp) => {

        let data = '';
        // Adata recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // response received
        resp.on('end', () => {
            const obj = JSON.parse(data);
            // default array
            const defaultArrayJson = { "mem_used": "", "fd_used": "", "sockets_used": "", "io_read_avg_time": "", "exchange_types": "" };
            //extracting data
            for (let i = 0; i < obj.length; i++) {
                const result = obj[i];
                defaultArrayJson.mem_used = result.mem_used;
                defaultArrayJson.fd_used = result.fd_used;
                defaultArrayJson.sockets_used = result.sockets_used;
                defaultArrayJson.io_read_avg_time = result.io_read_avg_time;
                defaultArrayJson.exchange_types = result.exchange_types;
            }
            res.write(JSON.stringify(defaultArrayJson));
            res.end();
        });

    }).on("error", (error) => {
        console.log("Error: " + error.message);
    }).end();
});

// GET/queue-statistic api
app.get("/queue-statistic", (req, res, next) => {
    http.get('http://guest:guest@rabbitmq:15672/api/queues', (resp) => {

        let data = '';
        // data recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // response received
        resp.on('end', () => {
            const obj = JSON.parse(data);
            const defaultFinalArrayJson = [];
            for (let i = 0; i < obj.length; i++) {
                const result = obj[i];
                if (result.message_stats) {
                    //extracting data   
                    defaultFinalArrayJson.push({ "publish": result.message_stats.publish, "publish_details": result.message_stats.publish_details, "deliver_get": result.message_stats.deliver_get, "deliver_get_details": result.message_stats.deliver_get_details, "deliver_no_ack": result.message_stats.deliver_no_ack, "deliver_no_ack_details": result.message_stats.deliver_no_ack_details });
                }
            }
            res.write(JSON.stringify(defaultFinalArrayJson));
            res.end();
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    }).end();
});


//listening to port 8081
const server = app.listen(8081, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log(host, port);
});

module.exports = server;
