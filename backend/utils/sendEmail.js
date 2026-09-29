async function sendOtpEmail(to, otp) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error(
      "Email is not configured — set BREVO_API_KEY and BREVO_FROM in .env",
    );
  }

  const fromHeader =
    process.env.BREVO_FROM || "MealDrop <no-reply@mealdrop.app>";
  const match = fromHeader.match(/^(.*)<(.+)>$/);
  const senderName = match ? match[1].trim().replace(/^"|"$/g, "") : "MealDrop";
  const senderEmail = match ? match[2].trim() : fromHeader.trim();

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: `${otp} is your MealDrop login code`,
      textContent: `Your MealDrop login code is ${otp}. It expires in 10 minutes.`,
      htmlContent: `<p style="font-family:sans-serif;font-size:15px">Your MealDrop login code is:</p>
             <p style="font-family:sans-serif;font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
             <p style="font-family:sans-serif;font-size:13px;color:#666">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Brevo API send failed: ${res.status} ${errBody}`);
  }
}

module.exports = { sendOtpEmail };
