const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const router = express.Router();

// Регистрация
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.send("User registered");
});

// Авторизация
router.post("/login", passport.authenticate("local"), (req, res) => {
    if (req.user.is2FAEnabled) {
        return res.json({ message: "2FA required", twoFARequired: true });
    }
    res.json({ message: "Login successful", twoFARequired: false });
});

// Генерация QR-кода
router.get("/setup-2fa", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Not authenticated");

    const secret = speakeasy.generateSecret({ length: 20 });
    await User.findByIdAndUpdate(req.user.id, { twoFASecret: secret.base32, is2FAEnabled: true });

    qrcode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
        if (err) return res.status(500).send("Error generating QR code");
        res.json({ qrCode: imageUrl, secret: secret.base32 });
    });
});

// Проверка OTP
router.post("/verify-otp", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Not authenticated");

    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token: otp
    });

    if (verified) {
        req.session.twoFAVerified = true;
        return res.json({ message: "2FA verification successful" });
    }
    res.status(400).send("Invalid OTP");
});

// Выход
router.get("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.send("Logged out");
    });
});

module.exports = router;
