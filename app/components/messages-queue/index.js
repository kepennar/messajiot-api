var rqr = require('rqr');
var amqp = require('amqp');
var amqpConfig = require('config').amqp;

var logger = rqr('app/components/logger').logger;
var HandlersManager = rqr('app/components/handlers-manager');

logger.debug('[AMQP] Attempt to conenct to', amqpConfig.host);

var connection = amqp.createConnection(amqpConfig);

// Wait for connection to become established.
connection.on('ready', function() {
  logger.debug('[AMQP] Connected to', amqpConfig.host);

  var exchange = connection.exchange('messages-exchange');
  var queue = connection.queue('messages');
  queue.bind('messages-exchange', 'messages:created', function() {
    logger.debug('[AMQP] queue binded to exchange ');
  });

  HandlersManager.global.addHandlers('messages', function(event) {
    logger.debug('[AMQP] Publish...');
    exchange.publish(event.event, event.data);
  });
});

// Bind connection errors to logger
connection.on('error', logger.error);
