// this is the tools that the ai will use to call

const tools = [
    {
        "name": "scheduleAppointment",
        "description": "Schedules a repair appointment for a customer given their phone number, phone model, issue, and preferred time.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_phone": {
                    "type": "string",
                    "description": "Customer's phone number"
                },
                "phone_model": {
                    "type": "string",
                    "description": "Customer's phone model"
                },
                "issue": {
                    "type": "string",
                    "description": "Description of the repair needed"
                },
                "preferred_time": {
                    "type": "string",
                    "description": "Customer's preferred appointment time (ISO 8601 format) knowing that the current time is " + new Date().toISOString()
                },
                "store_location": {
                    "type": "string",
                    "description": "Store location name or address or city or store id any thing that can be used to identify the store"
                },
                "details": {
                    "type": "string",
                    "description": "Details about customer's appointment like what they want to be done, any other information that is relevant"
                },


            },
            "required": ["customer_phone", "phone_model", "issue", "preferred_time", "store_location", "details"]
        }
    },
    {
        "name": "stopConvo",
        "description": "Stops the conversation and marks it as completed when the repair is out of scope or conversation needs to end",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_phone": {
                    "type": "string",
                    "description": "Customer's phone number"
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for stopping the conversation"
                }
            },
            "required": ["customer_phone", "reason"]
        }
    },
    {
        "name": "requestHumanCallback",
        "description": "Requests a human callback for complex situations or when customer specifically asks for human assistance",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_phone": {
                    "type": "string",
                    "description": "Customer's phone number"
                },
                "urgency": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Priority level of the callback request"
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for requesting human callback"
                }
            },
            "required": ["customer_phone", "urgency", "reason"]
        }
    },
    {
        "name": "updateInfo",
        "description": "Updates customer information when details need to be corrected or modified",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_phone": {
                    "type": "string",
                    "description": "Customer's phone number"
                },
                "updates": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Updated customer name"
                        },
                        "phone_model": {
                            "type": "string",
                            "description": "Updated phone model"
                        },
                        "issue": {
                            "type": "string",
                            "description": "Updated repair issue"
                        }
                    },
                    "description": "Fields to update"
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for the information update"
                }
            },
            "required": ["customer_phone", "updates"]
        }
    },
    {
        "name": "updateAppointment",
        "description": "Updates an existing appointment time or details for a customer",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_phone": {
                    "type": "string",
                    "description": "Customer's phone number"
                },
                "appointment_id": {
                    "type": "string",
                    "description": "ID of the appointment to update"
                },
                "new_time": {
                    "type": "string",
                    "description": "New appointment time (ISO 8601 format)"
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for the appointment update"
                }
            },
            "required": ["customer_phone", "new_time"]
        }
    }
];

module.exports = tools; 