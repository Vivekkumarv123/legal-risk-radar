import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
function createTransporter() {
    const emailUser = process.env.EMAIL_USER || process.env.SMTP_EMAIL;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;

    // Check if credentials are available
    if (!emailUser || !emailPass) {
        console.error('Email credentials missing. Please set EMAIL_USER/SMTP_EMAIL and EMAIL_PASSWORD/SMTP_PASS in environment variables.');
        throw new Error('Email credentials not configured');
    }

    // Using Gmail SMTP - you can change this to any email service
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
}

/**
 * Send newsletter email to a single recipient
 */
export async function sendNewsletterEmail(to, subject, htmlContent, recipientName = 'Subscriber') {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"LegalAdvisor Newsletter" <${process.env.EMAIL_USER || process.env.SMTP_EMAIL}>`,
            to: to,
            subject: subject,
            html: htmlContent,
            text: htmlContent.replace(/<[^>]*>/g, ''), // Plain text fallback
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`Newsletter sent to ${to}: ${info.messageId}`);
        
        return {
            success: true,
            messageId: info.messageId,
            recipient: to
        };
    } catch (error) {
        console.error(`Error sending newsletter to ${to}:`, error);
        return {
            success: false,
            error: error.message,
            recipient: to
        };
    }
}

/**
 * Send newsletter to multiple recipients (batch)
 */
export async function sendBulkNewsletters(recipients, subject, htmlContentGenerator) {
    const results = {
        total: recipients.length,
        sent: 0,
        failed: 0,
        errors: []
    };

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    const delay = 1000; // 1 second delay between batches

    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (recipient) => {
            const htmlContent = typeof htmlContentGenerator === 'function' 
                ? htmlContentGenerator(recipient) 
                : htmlContentGenerator;
            
            const result = await sendNewsletterEmail(
                recipient.email,
                subject,
                htmlContent,
                recipient.name || 'Subscriber'
            );

            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
                results.errors.push({
                    email: recipient.email,
                    error: result.error
                });
            }

            return result;
        });

        await Promise.all(batchPromises);

        // Delay between batches
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return results;
}

/**
 * Send test newsletter
 */
export async function sendTestNewsletter(to, htmlContent) {
    return sendNewsletterEmail(
        to,
        `[TEST] Legal Newsletter - ${new Date().toLocaleDateString()}`,
        htmlContent,
        'Test Recipient'
    );
}
