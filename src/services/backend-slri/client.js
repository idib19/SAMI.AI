const { Client } = require("@gadget-client/my-slri-01");
const api = new Client();

const createAppointment = async (appointment) => {
    const appointmentRecord = await api.appointment.create(appointment);
    return appointmentRecord;
};



module.exports = {
    createAppointment
};


