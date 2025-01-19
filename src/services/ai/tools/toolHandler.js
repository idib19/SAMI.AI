const logger = require('../../../utils/logger');
const { createAppointment } = require('../../../services/backend-slri/client');

class ToolHandler {
    constructor() {
        // Bind methods to preserve 'this' context
        this.handleResponse = this.handleResponse.bind(this);
        this.handleToolUse = this.handleToolUse.bind(this);
        this.processToolCall = this.processToolCall.bind(this);
    }

    async handleResponse(response, messages) {
        if (response.stop_reason === "tool_use") {
            return await this.handleToolUse(response, messages);
        }
        return { content: response.content[0]?.text };
    }

    async handleToolUse(response, messages, client) {
        // While loop to handle repeated requests
        while (response.stop_reason === 'tool_use') {
          // 1) Locate the tool usage block
          const toolUse = response.content.find(block => block.type === "tool_use");
          if (!toolUse) break;
    
          // 2) Actually call the tool
          const toolResult = await this.processToolCall(toolUse.name, toolUse.input);
    
          // 3) Add the tool result into the conversation
          messages.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: JSON.stringify(toolResult)
              }
            ]
          });
    
          // 4) Ask Claude again
          response = await client.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 200,
            tools: this.tools,
            messages: messages
          });
        }
    
        // Return final
        return {
          content: response.content[0]?.text,
          messages,
          response
        };
      }
    

    // this is what the ai will use to call the tools
    async processToolCall(toolName, toolInput) {
        switch (toolName) {
            case "scheduleAppointment":
                try {
                    logger.info('Starting scheduleAppointment process', { toolInput });

                    // Validate that the preferred time is not in the past
                    const preferredTime = new Date(toolInput.preferred_time);
                    const currentTime = new Date();
                    logger.info('Time validation', { 
                        preferredTime: preferredTime.toISOString(), 
                        currentTime: currentTime.toISOString() 
                    });

                    if (preferredTime < currentTime) {
                        logger.warn('Appointment time is in the past', { preferredTime });
                        return {
                            success: false,
                            error: "Cannot schedule appointments in the past. Please provide a future date and time."
                        };
                    }

                    const appointment = {
                        details: {
                            raw: toolInput.details,
                            json: {
                                type: "doc",
                                content: [{
                                    type: "paragraph",
                                    content: [{
                                        type: "text",
                                        text: toolInput.details
                                    }]
                                }]
                            }
                        },
                        location: toolInput.location || toolInput.store_location,
                        time: preferredTime.toISOString(),
                        status: "pending",
                        customer_phone: toolInput.customer_phone,
                        phone_model: toolInput.phone_model,
                        issue: toolInput.issue
                    };
                    
                    logger.info('Attempting to create appointment', { appointment });
                    const appointmentRecord = await createAppointment(appointment);
                    logger.info('Appointment created successfully', { appointmentRecord });
                    
                    return {
                        success: true,
                        appointment_id: appointmentRecord.id,
                        scheduled_time: appointmentRecord.time,
                        message: `Appointment successfully scheduled at ${appointmentRecord.location} at ${new Date(appointmentRecord.time).toLocaleString()}`
                    };

                } catch (error) {
                    logger.error('Error scheduling appointment:', { 
                        error: error.message,
                        stack: error.stack,
                        toolInput 
                    });
                    return {
                        success: false,
                        error: `Failed to schedule appointment: ${error.message}`
                    };
                }

            case "stopConvo":
                try {
                    // Simulate conversation stopping
                    return {
                        success: true,
                        message: "Conversation marked as completed",
                        reason: toolInput.reason
                    };
                } catch (error) {
                    logger.error('Error stopping conversation:', error);
                    return {
                        success: false,
                        error: "Failed to stop conversation"
                    };
                }

            case "requestHumanCallback":
                try {
                    // Simulate callback request
                    return {
                        success: true,
                        message: "Callback request registered",
                        callback_id: `CB-${Date.now()}`,
                        urgency: toolInput.urgency
                    };
                } catch (error) {
                    console.error('Error requesting callback:', error);
                    return {
                        success: false,
                        error: "Failed to request callback"
                    };
                }

            case "updateInfo":
                try {
                    // Simulate info update
                    return {
                        success: true,
                        message: "Customer information updated successfully",
                        updated_fields: Object.keys(toolInput.updates),
                        customer_phone: toolInput.customer_phone
                    };
                } catch (error) {
                    logger.error('Error updating customer information:', error);
                    return {
                        success: false,
                        error: "Failed to update customer information"
                    };
                }

            case "updateAppointment":
                try {
                    // Simulate appointment update
                    return {
                        success: true,
                        message: "Appointment successfully updated",
                        new_time: toolInput.new_time,
                        customer_phone: toolInput.customer_phone,
                        appointment_id: toolInput.appointment_id || `APT-${Date.now()}`
                    };
                } catch (error) {
                    logger.error('Error updating appointment:', error);
                    return {
                        success: false,
                        error: "Failed to update appointment"
                    };
                }

            default:
                return {
                    success: false,
                    error: "Unknown tool"
                };
        }
    }
}

module.exports = new ToolHandler(); 