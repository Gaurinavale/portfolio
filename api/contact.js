const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  // Validate inputs
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Create email transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Email to you (Gauri)
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'gaurinavale26@gmail.com', // Change to your email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #a78bfa;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This email was sent from your portfolio contact form.
          </p>
        </div>
      `,
    };

    // Confirmation email to user
    const confirmationEmail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Message Received - Gauri Navale',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #a78bfa;">Thanks for reaching out! 🚀</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>I received your message and will get back to you as soon as possible.</p>
          <p><strong>Your Message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p>Best regards,<br><strong>Gauri Navale</strong><br>AI/ML Engineer</p>
          <p style="color: #999; font-size: 12px;">
            📧 gaurinavale26@gmail.com<br>
            🔗 github.com/Gaurinavale<br>
            💼 linkedin.com/in/gauri-navale
          </p>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(confirmationEmail);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully! Check your inbox.',
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      error: 'Failed to send email. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// Sanitize HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
