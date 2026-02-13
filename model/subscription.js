const mongoose = require('mongoose');

const subscription = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store',
        required: true
    },
    subscribed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("subscription", subscription);
