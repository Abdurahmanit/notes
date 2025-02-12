const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFASecret: { type: String, default: "" },  // 2FA секрет
    is2FAEnabled: { type: Boolean, default: false }  // Флаг 2FA
});

module.exports = mongoose.model("User", UserSchema);
