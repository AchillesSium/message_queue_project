const amqp = require('amqplib/callback_api');
amqp.connect('amqp://guest:guest@rabbitmq:5672', (err, connection) => {
    if (err) {
        console.log(`Error ${err}`);
    }
    connection.createChannel((error, channel) => {
        if (error) {
            console.log(`Error ${err}`);
        }
        const myTopic = 'topic_my';
        const key = 'my.o';
        const msgs = ['MSG_1','MSG_2','MSG_3'];

        channel.assertExchange(myTopic, 'topic', {
            durable: false
            });
        var flag=0;
        setInterval(function() {
            if(flag<3){
                channel.publish(myTopic, key, Buffer.from(msgs[flag])); // publishing message according to topic and key
                console.log(" !!! Publishing message %s:%s !!!", key, msgs[flag]);
                flag++;
            }
            }, 3000);
    });

    setTimeout(function() { 
        connection.close(); 
        process.exit(0) 
    }, 10000);

    
});
