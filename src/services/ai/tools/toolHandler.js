const logger = require('../../../utils/logger');
const { createAppointment } = require('../../../services/backend-slri/client');

class ToolHandler {
    async handleResponse(response, messages) {
        if (response.stop_reason === "tool_use") {
            return await this.handleToolUse(response, messages);
        }
        return { content: response.content[0]?.text };
    }

    async handleToolUse(response, messages) {
        const toolUse = response.content.find(block => block.type === "tool_use");
        if (toolUse) {
            // 1- call the tool
            const toolResult = await this.processToolCall(toolUse.name, toolUse.input);
            // add the tool result to the messages
            messages.push({
                role: "assistant",
                content: `Tool ${toolUse.name} was called with result: ${JSON.stringify(toolResult)}`
            });

            return {
                content: toolResult.message || "Tool execution completed",
                toolResult: toolResult
            };
        }
        return { content: "No tool use found in response" };
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