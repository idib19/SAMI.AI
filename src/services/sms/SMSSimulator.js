const readline = require('readline');
const axios = require('axios');

class SMSSimulator {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.phoneNumber = '+1234567890'; // Simulated phone number
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('\n🤖 SMS Simulator Started');
        console.log(`📱 Your simulated phone number is: ${this.phoneNumber}`);
        console.log('\nOptions:');
        console.log('1. Start new conversation (first contact)');
        console.log('2. Continue existing conversation');
        console.log('3. Exit\n');

        this.showMainMenu();
    }

    showMainMenu() {
        this.rl.question('Select option (1-3): ', async (choice) => {
            switch(choice) {
                case '1':
                    await this.initiateFirstContact();
                    break;
                case '2':
                    await this.startConversation();
                    break;
                case '3':
                    this.rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log('\n❌ Invalid option. Please try again.');
                    this.showMainMenu();
            }
        });
    }

    async initiateFirstContact() {
        console.log('\n📱 Starting new conversation...');
        console.log('Please provide customer information:');

        const customerInfo = await this.getCustomerInfo();
        
        try {
            const response = await axios.post(`${this.baseUrl}/sms/trigger-message`, {
                phoneNumber: this.phoneNumber,
                customerInfo
            });

            console.log('\n📱 First contact message:', response.data.content);
            console.log('\nStarting conversation...\n');
            
            // Continue with normal conversation after first contact
            this.startConversation();

        } catch (error) {
            console.error('\n❌ Error sending first contact message:', error.message);
            this.showMainMenu();
        }
    }

    async getCustomerInfo() {
        
        const info = {};
        
        return new Promise((resolve) => {
            this.rl.question('Customer name: ', (name) => {
                info.name = name;
                this.rl.question('Phone model: ', (phoneModel) => {
                    info.phoneModel = phoneModel;
                    this.rl.question('Issue description: ', (issue) => {
                        info.issue = issue;
                        resolve(info);
                    });
                });
            });
        });
    }

    async startConversation() {
        console.log('\nType your messages and press Enter to send. (Type "menu" to return to main menu)\n');
        this.promptUser();
    }

    promptUser() {
        this.rl.question('SMS > ', async (input) => {
            if (input.toLowerCase() === 'menu') {
                console.log('\n');
                this.showMainMenu();
                return;
            }

            try {
                // Simulate an incoming webhook from Twilio
                const response = await axios.post(`${this.baseUrl}/sms/webhook`, {
                    Body: input,
                    From: this.phoneNumber,
                    To: 'BUSINESS_NUMBER'
                });

                // Log the AI's response
                console.log('\n📱 Received response:', response.data.content);
                
            } catch (error) {
                console.error('\n❌ Error sending message:', error.message);
            }

            // Continue the conversation
            this.promptUser();
        });
    }
}

// If this file is run directly (not required as a module)
if (require.main === module) {
    const simulator = new SMSSimulator();
    simulator.start();
}

module.exports = SMSSimulator; 