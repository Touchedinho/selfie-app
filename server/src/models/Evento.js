const mongoose = require('mongoose');

const Evento = new mongoose.Schema({
    autore: {
        type: String,
        required: true
    },  
    id: {
        type: Number,
        required: true  
    },
    titolo: {
        type: String,
        required: true
    },  
    descr: {
        type: String,
        required: true
    },


    allDay: { 
        type: Boolean, 
        default: true 
    },
    startTime: { 
        type: String, 
        default: "00:00" 
    },
    endTime: { 
        type: String, 
        default: "23:59" 
    },

    location: {
        type: String,
        default: ''
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },

    repeat: { 
        type: Boolean, 
        default: false 
    },
    repeatFrequency: { 
        type: String, 
        enum: ['weekly', 'monthly', 'yearly'], 
        default: 'weekly' 
    },
    repeatDuration: { 
        type: String, 
        default: '1' 
    },
    repeatId: { 
        type: String, 
        default: null 
    },
    
    data_ev: { 
        type: Date 
    },
    data_cr: { 
        type: Date
    },
    data_md: { 
        type: Date, 
        default: Date.now 
    },
    
    pomodoro_id: {
        type: Number,
        default: -1
    }
});

module.exports = mongoose.model('eventi', Evento);
