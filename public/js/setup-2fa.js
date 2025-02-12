document.getElementById("generateQR").addEventListener("click", async () => {
    console.log("Кнопка нажата, отправляю запрос на /setup-2fa");

    try {
        const response = await fetch("/setup-2fa");
        const data = await response.json();

        if (response.ok) {
            console.log("QR-код получен:", data.qrCode);
            document.getElementById("qrContainer").style.display = "block";
            document.getElementById("qrCode").src = data.qrCode;
            document.getElementById("secretKey").textContent = data.secret;
        } else {
            console.error("Ошибка запроса:", data);
            alert("Error generating QR code");
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
});

document.getElementById("verifyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otp").value;

    const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
    });

    const message = await response.text();
    if (response.ok) {
        document.getElementById("statusMessage").textContent = "2FA setup successful!";
        document.getElementById("statusMessage").style.color = "green";
    } else {
        document.getElementById("statusMessage").textContent = "Invalid OTP, try again.";
        document.getElementById("statusMessage").style.color = "red";
    }
});
