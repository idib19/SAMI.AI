/**
 * Development SMS Service that logs messages to console instead of sending real SMS
 * 
 * This service implements the same interface as TwilioService but is used in development
 * environment to avoid sending actual SMS messages. It logs messages to the console and
 * emits events that can be used by the SMS simulator for testing.
 * 
 * The SMSServiceFactory determines whether to use this or the real TwilioService based
 * on the environment configuration. This allows seamless switching between development
 * and production SMS handling.
 * 
 * Key features:
 * - Logs messages to console instead of sending real SMS
 * - Emits 'messageSent' events that can be listened to by the SMS simulator
 * - Implements TwiML response format for compatibility with Twilio webhook interface
 */

const logger = require('../../utils/logger');
const EventEmitter = require('events');

class ConsoleSMSService extends EventEmitter {
    constructor() {
        super();
        this.phoneNumber = 'DEV-NUMBER';
    }

    validateRequest(req) {
        return true;
    }

    async sendMessage(toNumber, messageBody) {
        logger.info('📱 [DEV SMS] To:', toNumber);
        logger.info('📝 Message:', messageBody);

        // Emit an event when a message is sent
        this.emit('messageSent', {
            to: toNumber,
            body: messageBody
        });

        return {
            sid: 'dev-message-id-' + Date.now(),
            status: 'delivered'
        };
    }

    createTwiMLResponse(message) {
        return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
    }
}

module.exports = ConsoleSMSService; 