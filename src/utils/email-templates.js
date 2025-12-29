export const getResetPasswordEmailHtml = (otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
    .header { background-color: #2563eb; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 40px; color: #334155; line-height: 1.6; }
    .otp-box { background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 32px; font-weight: 700; color: #1e293b; letter-spacing: 5px; font-family: monospace; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .link { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Legal Advisor</h1>
    </div>
    
    <div class="content">
      <h2 style="margin-top: 0; color: #1e293b;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Legal Advisor account. Use the verification code below to proceed:</p>
      
      <div class="otp-box">
        <span class="otp-code">${otp}</span>
      </div>
      
      <p style="font-size: 14px; color: #64748b; text-align: center;">
        This code will expire in <strong>10 minutes</strong>.
      </p>
      
      <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Legal Advisor Inc. All rights reserved.</p>
      <p>Need help? <a href="#" class="link">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
  `;
};


export const getSignupEmailHtml = (name, email, password) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Legal Advisor</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
    .header { background-color: #2563eb; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 40px; color: #334155; line-height: 1.6; }
    .credentials-box { background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; display: block; }
    .value { font-size: 16px; color: #1e293b; font-weight: 500; margin-bottom: 16px; font-family: monospace; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Legal Advisor</h1>
    </div>
    
    <div class="content">
      <h2 style="margin-top: 0; color: #1e293b;">Welcome, ${name}! 🎉</h2>
      <p>Your account has been successfully created. Below are your temporary login credentials.</p>
      
      <div class="credentials-box">
        <span class="label">Email ID</span>
        <div class="value">${email}</div>
        
        <span class="label">Temporary Password</span>
        <div class="value" style="font-size: 18px; letter-spacing: 1px; color: #2563eb;">${password}</div>
      </div>
      
      <p>Please log in and change your password immediately for security.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" class="btn">Login to Account</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Legal Advisor Inc. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};