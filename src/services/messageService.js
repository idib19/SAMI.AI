//# Message handling logic
// here we will handle the message data and save it to the database
// it also will handle the conversation history and update the customer info


const Message = require('../models/message');
const logger = require('../utils/logger');
const { standardizePhoneNumber } = require('../utils/phoneUtils');


class MessageService {

    // Save a new message to the database
    async saveMessage(messageData) {
        try {
            const standardizedPhone = standardizePhoneNumber(messageData.phoneNumber);


            const message = new Message({
                ...messageData,
                phoneNumber: standardizedPhone
            });

            await message.save();

            return message;
        } catch (error) {
            logger.error('Error saving message:', error);
            throw error;
        }
    }
    // Get the conversation history for a given phone number
    async getConversationHistory(phoneNumber, limit = 100) {
        try {
            const standardizedPhone = standardizePhoneNumber(phoneNumber);
            logger.info(`Fetching conversation history for ${standardizedPhone}`);

            const messages = await Message.find({ phoneNumber: standardizedPhone })
                .sort({ createdAt: 1 })
                .limit(limit);

            const formattedMessages = messages.map(message => ({
                direction: message.direction,
                content: message.content
            }));

            logger.info(`Found ${messages.length} messages for ${standardizedPhone}`);
            return formattedMessages ;
        } catch (error) {
            logger.error('Error fetching conversation history:', error);
            throw error;
        }
    }

    // get customer name , email , phone model , issue description from the database 
    async getCustomerInfo(phoneNumber) {
        const customerInfo = await Message.findOne({ phoneNumber })
            .select('customerName phoneModel issueDescription');
        return customerInfo;
    }


    // Update customer info in the database
    async updateCustomerInfo(phoneNumber, customerInfo) {
        try {
            const result = await Message.updateMany(
                { phoneNumber },
                {
                    $set: {
                        customerName: customerInfo.name,
                        customerEmail: customerInfo.email,
                        phoneModel: customerInfo.phoneModel,
                        issueDescription: customerInfo.issueDescription
                    }
                }
            );

            return result;
        } catch (error) {
            logger.error('Error updating customer info:', error);
            throw error;
        }
    }
}

module.exports = new MessageService();