const amqp = require('amqplib/callback_api');
var fs = require('fs');
fs.writeFile('app/data.txt', '', function (err) {
    if (err) throw err;
    console.log('File Created!');
  });
amqp.connect('amqp://guest:guest@rabbitmq:5672', (error, connection) => {
    if (error) {
        console.log(`Error ${error}`);
    }
       
    //creating channel
    connection.createChannel((error, channel) => {
        if (error) {
            console.log(`Error ${error}`);
        }
        const myTopic = 'topic_my';
        const key = 'my.#';
        channel.assertExchange(myTopic, 'topic', {
            durable: false
            });
            channel.assertQueue('', {
                exclusive: true
              }, function(error2, q) {
                if (error2) {
                    console.log(`Error ${error2}`);
                }
                channel.bindQueue(q.queue, myTopic, key);
                channel.consume(q.queue, function(msg) {
                    const date = new Date();
                    const dateStr = date.toISOString();
                    const msgTxt = `${dateStr} Topic ${msg.fields.routingKey}:${msg.content} \n`;
                    //appending message to data.txt with current data and time
                    fs.appendFile('app/data.txt', msgTxt, function (err) {
                        if (err) throw err;
                        console.log('Message saved!',msgTxt);
                      });
                }, {
                  noAck: true
                });
              });
        
    });
});
