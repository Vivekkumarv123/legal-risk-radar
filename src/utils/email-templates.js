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

export const getGoogleSignupEmailHtml = (name, email) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership Confirmed</title>
  <style>
    body { margin: 0; padding: 0; min-width: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; background-color: #0f172a; }
    .btn:hover { background-color: #e2b866 !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a;">

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your exclusive access to Legal Advisor is confirmed.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
            <tr>
                <td height="4" style="background-color: #c5a059; border-top-left-radius: 4px; border-top-right-radius: 4px;"></td>
            </tr>
        </table>

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; overflow: hidden; width: 100%; max-width: 600px;">
          
          <tr>
            <td align="center" style="padding: 50px 40px 10px 40px;">
               <p style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #c5a059; font-weight: bold;">
                 Welcome to the Firm
               </p>
               <h1 style="margin: 15px 0 0 0; font-family: 'Times New Roman', Georgia, serif; font-size: 36px; color: #0f172a; font-weight: 400; letter-spacing: -0.5px;">
                 Legal Advisor
               </h1>
               <div style="width: 40px; height: 1px; background-color: #e2e8f0; margin: 20px auto;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 50px 30px 50px; text-align: center;">
              <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #475569;">
                Greetings, <strong>${name}</strong>.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 16px; line-height: 1.8; color: #475569;">
                Your request for access has been approved. You have successfully authenticated via <strong>Google Secure Sign-In</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1e293b; background-image: radial-gradient(circle at top right, #334155 0%, #1e293b 100%); border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
                    <tr>
                        <td style="padding: 30px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td valign="top">
                                        <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">
                                            Registered Member
                                        </p>
                                        <p style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 500;">
                                            ${name}
                                        </p>
                                    </td>
                                    <td valign="top" align="right">
                                        <div style="color: #c5a059; font-size: 24px;">✦</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" height="20"></td>
                                </tr>
                                <tr>
                                    <td valign="bottom">
                                        <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">
                                            Access ID (Email)
                                        </p>
                                        <p style="margin: 0; font-size: 15px; color: #e2e8f0;">
                                            ${email}
                                        </p>
                                    </td>
                                    <td valign="bottom" align="right">
                                        <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">
                                            Method
                                        </p>
                                        <div style="background-color: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;">
                                            <span style="font-size: 12px; color: #ffffff;">Google Auth</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px 40px 50px 40px;">
              <p style="margin: 0 0 30px 0; font-size: 14px; color: #64748b; font-style: italic;">
                "Justice consists not in being neutral between right and wrong, but in finding out the right and upholding it."
              </p>
            </td>
          </tr>

        </table>
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
                Legal Advisor Inc.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #475569;">
                Privileged & Confidential Communication.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getGoogleSignupEmailText = (name, email) => `
Hello ${name},

Welcome to Legal Advisor.

Your account has been successfully created using Google Sign-In.

Registered Email:
${email}

You can now securely access the platform using your Google account.
No password setup is required.

If you did not create this account, please contact support immediately.

Regards,
Legal Advisor Team
`;

export const getAccountDeletedEmailHtml = (name, email) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Termination Notice</title>
  <style>
    body { margin: 0; padding: 0; min-width: 100%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; background-color: #0f172a; }
    .btn:hover { background-color: #e2b866 !important; }
    .link:hover { color: #e2b866 !important; text-decoration: underline !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a;">

  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your Legal Advisor account has been permanently closed.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
            <tr>
                <td height="4" style="background-color: #c5a059; border-top-left-radius: 4px; border-top-right-radius: 4px;"></td>
            </tr>
        </table>

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; overflow: hidden; width: 100%; max-width: 600px;">
          
          <tr>
            <td align="center" style="padding: 50px 40px 10px 40px;">
               <p style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: bold;">
                 Notice of Closure
               </p>
               <h1 style="margin: 15px 0 0 0; font-family: 'Times New Roman', Georgia, serif; font-size: 32px; color: #0f172a; font-weight: 400; letter-spacing: -0.5px;">
                 Account Deleted
               </h1>
               <div style="width: 40px; height: 1px; background-color: #e2e8f0; margin: 20px auto;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 50px 30px 50px; text-align: center;">
              <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #475569;">
                Dear <strong>${name || "Member"}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 1.8; color: #475569;">
                This correspondence confirms that your <strong>Legal Advisor</strong> account associated with <span style="color: #0f172a; font-weight: 600;">${email}</span> has been permanently removed from our records.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1e293b; background-image: radial-gradient(circle at top right, #334155 0%, #1e293b 100%); border-radius: 8px; border: 1px solid #334155;">
                    <tr>
                        <td style="padding: 25px;">
                            <p style="margin: 0 0 15px 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                                Actions Taken
                            </p>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td width="20" style="padding-bottom: 10px; vertical-align: top; color: #c5a059;">✓</td>
                                    <td style="padding-bottom: 10px; font-size: 14px; color: #e2e8f0;">Personal Profile Terminated</td>
                                </tr>
                                <tr>
                                    <td width="20" style="padding-bottom: 10px; vertical-align: top; color: #c5a059;">✓</td>
                                    <td style="padding-bottom: 10px; font-size: 14px; color: #e2e8f0;">Data & Documents Purged</td>
                                </tr>
                                <tr>
                                    <td width="20" style="vertical-align: top; color: #c5a059;">✓</td>
                                    <td style="font-size: 14px; color: #e2e8f0;">Access Revoked</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569;">
                We strive for excellence. If you have a moment, we would value your insight on why you chose to leave.
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 25px;">
                <tr>
                    <td align="center">
                        <a href="https://legal-risk-radar.vercel.app/pages/feedback" class="btn" style="display: inline-block; padding: 14px 30px; background-color: #0f172a; color: #c5a059; text-decoration: none; border-radius: 2px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #c5a059;">
                            Provide Feedback
                        </a>
                    </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px 50px 40px; text-align: center;">
               <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                 <strong>Security Alert:</strong> If this action was not authorized by you, please contact our <a href="mailto:security@legaladvisor.ai" class="link" style="color: #0f172a; text-decoration: underline;">Security Team</a> immediately.
               </p>
            </td>
          </tr>

        </table>
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
                Legal Advisor Inc.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #475569;">
                We are sorry to see you go.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getAccountDeletedEmailText = (name, email) => `
Hello ${name || "User"},

This email confirms that your Legal Advisor account associated with
${email} has been permanently deleted.

What this means:
- Your profile and preferences have been removed
- Your chats and documents have been deleted
- Your access has been revoked

This action is irreversible.

If you did not request this deletion, please contact support immediately.

Regards,
Legal Advisor Team
`;
