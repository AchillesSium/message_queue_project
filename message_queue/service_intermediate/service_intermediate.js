const amqp = require('amqplib/callback_api');
amqp.connect('amqp://guest:guest@rabbitmq:5672', (err, connection) => {
    if (err) {
        console.log(`Error ${err}`);
    }
      
    //creating channel 
    connection.createChannel((error, channel) => {
        if (error) {
            console.log(`Error ${err}`);
        }
        const myTopic = 'topic_my';
        const keyO = 'my.o';
        const keyI = 'my.i';
        channel.assertExchange(myTopic, 'topic', {
            durable: false
            });
            channel.assertQueue('', {
                exclusive: true
              }, function(err2, q) {
                if (err2) {
                    console.log(`Error ${err2}`);
                }
                channel.bindQueue(q.queue, myTopic, keyO); //binding to the topic and specified key
                channel.consume(q.queue, function(msg) {
                    setTimeout(() => {
                        channel.publish(myTopic, keyI, Buffer.from('Got ' + msg.content));
                        console.log(" !!! Got message key and content %s:%s !!!", keyI, msg.content);
                    }, 1000);
                }, {
                  noAck: true
                });
              });
        
    });   
});
