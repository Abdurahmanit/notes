require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/auth");
const path = require("path");

const app = express();

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // Разрешает доступ к HTML-файлам

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

require("./config/passport");

app.use("/", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("Unauthorized: Please log in first.");
}

app.get("/setup-2fa", ensureAuthenticated, async (req, res) => {
    console.log("Запрос на /setup-2fa получен от", req.user.username);

    const secret = speakeasy.generateSecret({ length: 20 });
    await User.findByIdAndUpdate(req.user.id, { twoFASecret: secret.base32, is2FAEnabled: true });

    qrcode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
        if (err) return res.status(500).send("Error generating QR code");
        res.json({ qrCode: imageUrl, secret: secret.base32 });
    });
});

