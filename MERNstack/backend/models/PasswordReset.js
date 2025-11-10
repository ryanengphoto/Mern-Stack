const mongoose = require('mongoose');

const PasswordResetToken = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type : Date, default: Date.now, expires: 1800 } // expires in 30 minutes
});

module.exports = mongoose.model('PasswordResetToken', PasswordResetToken);