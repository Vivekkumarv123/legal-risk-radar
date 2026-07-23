import { executeWithKeyRotation } from "@/lib/geminiKeyRotation";

/**
 * Generate daily legal newsletter content using Gemini AI with key rotation
 */
export async function generateDailyNewsletter() {
    try {
        const result = await executeWithKeyRotation(async (genAI) => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `Generate a concise, engaging daily legal newsletter for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

IMPORTANT: Keep it SHORT and SCANNABLE. Use simple language.

Include ONLY these 3 sections:

1. **📰 Top Legal Story** (100 words max)
   - One major legal development today
   - Case name or bill name
   - Why it matters in 1-2 sentences
   - Keep it simple and clear

2. **⚡ Quick Updates** (3 items, 40 words each)
   - Brief legal news from different areas
   - Use bullet points
   - Focus on practical impact

3. **💡 Legal Tip** (60 words max)
   - One practical tip for individuals or businesses
   - Actionable advice
   - Easy to understand

FORMAT RULES:
- Use simple, clear language (avoid legal jargon)
- Keep sentences short
- Use emojis for visual appeal
- Make it scannable
- Focus on Indian legal system
- NO lengthy explanations
- NO complex legal terminology

Write in a friendly, conversational tone like you're explaining to a friend.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const content = response.text();

            return {
                success: true,
                content: content,
                generatedAt: new Date(),
                title: `Legal Newsletter - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
            };
        });

        return result;
    } catch (error) {
        console.error('Error generating newsletter:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate category-specific newsletter
 */
export async function generateCategoryNewsletter(category) {
    try {
        const result = await executeWithKeyRotation(async (genAI) => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const categoryNames = {
                criminal: 'Criminal Law',
                civil: 'Civil Law',
                corporate: 'Corporate Law',
                tax: 'Tax Law',
                constitutional: 'Constitutional Law',
                property: 'Property Law',
                family: 'Family Law',
                labour: 'Labour Law',
                cyber: 'Cyber Law'
            };

            const prompt = `Generate a focused ${categoryNames[category]} newsletter for today.

Include:
1. Major ${categoryNames[category]} development or ruling (150-200 words)
2. 3 recent updates in ${categoryNames[category]} (50-75 words each)
3. Practical tip related to ${categoryNames[category]} (75-100 words)
4. Important case or legislation to watch in ${categoryNames[category]}

Make it informative and relevant to legal professionals and interested individuals.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const content = response.text();

            return {
                success: true,
                content: content,
                category: category,
                generatedAt: new Date()
            };
        });

        return result;
    } catch (error) {
        console.error(`Error generating ${category} newsletter:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * ============================================
 * EMAIL TEMPLATE - THIS IS WHERE YOU CUSTOMIZE
 * ============================================
 * 
 * Get newsletter template with content
 * This function returns the HTML email template
 * 
 * @param {string} content - The newsletter content (AI-generated)
 * @param {string} subscriberName - Name of the subscriber
 * @param {string} unsubscribeToken - Token for unsubscribe link
 * @returns {string} HTML email template
 */
export function getNewsletterTemplate(content, subscriberName = 'Legal Enthusiast', unsubscribeToken = '') {
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Enhanced markdown to HTML conversion
    let formattedContent = content
        // Headers
        .replace(/### (.*?)(\n|$)/g, '<h3 style="margin:25px 0 12px 0;font-size:18px;color:#333;font-weight:600;">$1</h3>')
        .replace(/## (.*?)(\n|$)/g, '<h2 style="margin:30px 0 15px 0;font-size:20px;color:#333;font-weight:600;">$1</h2>')
        .replace(/# (.*?)(\n|$)/g, '<h1 style="margin:30px 0 15px 0;font-size:24px;color:#333;font-weight:600;">$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#333;font-weight:600;">$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Bullet points
        .replace(/^\* (.*?)$/gm, '<li style="margin:8px 0;color:#555;line-height:1.6;">$1</li>')
        .replace(/^- (.*?)$/gm, '<li style="margin:8px 0;color:#555;line-height:1.6;">$1</li>')
        // Wrap consecutive list items in ul
        .replace(/(<li.*?<\/li>\n?)+/g, '<ul style="margin:15px 0;padding-left:20px;list-style-type:disc;">$&</ul>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p style="margin:15px 0;color:#555;line-height:1.7;font-size:15px;">')
        // Single line breaks
        .replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!formattedContent.startsWith('<')) {
        formattedContent = '<p style="margin:15px 0;color:#555;line-height:1.7;font-size:15px;">' + formattedContent + '</p>';
    }

    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>LegalAdvisor Briefing</title>
    
    <style>
        /* RESET & BASICS */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: Georgia, 'Times New Roman', Times, serif; background-color: #f4f4f4; color: #1a1a1a; }
        
        /* CLIENT-SPECIFIC FIXES */
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        div[style*="margin: 16px 0"] { margin: 0 !important; }
        
        /* MOBILE STYLES */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 25px 20px !important; }
            .header-text { font-size: 24px !important; }
            .mobile-btn { width: 100% !important; display: block !important; padding: 15px 0 !important; }
        }
    </style>

    </head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">

    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Georgia, serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Legal insights and updates for ${subscriberName}...
    </div>

    <center style="width: 100%; background-color: #f4f4f4; padding: 20px 0;">
        
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; width: 600px; margin: 0 auto; box-shadow: 0 1px 5px rgba(0,0,0,0.05); border-top: 5px solid #002b49;">
            
            <tr>
                <td align="center" style="padding: 40px 40px 10px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center">
                                <h1 class="header-text serif" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 30px; color: #002b49; text-transform: uppercase; letter-spacing: 2px; font-weight: 400; border-bottom: 1px solid #d4af37; padding-bottom: 20px; display: inline-block;">
                                    LEGAL ADVISOR
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 15px;">
                                <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1.5px;">
                                    ${currentDate}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td class="content-padding" style="padding: 30px 50px 40px 50px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        
                        <tr>
                            <td class="serif" style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #1a1a1a; padding-bottom: 25px;">
                                Dear ${subscriberName},
                            </td>
                        </tr>

                        <tr>
                            <td class="serif" style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.8; color: #333333; text-align: left;">
                                <div style="font-family: Georgia, 'Times New Roman', serif;">
                                    ${formattedContent}
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="padding-top: 40px; padding-bottom: 10px;">
                                <table border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center" style="border-radius: 2px;" bgcolor="#002b49">
                                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pages/login" target="_blank" class="mobile-btn" style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; background-color: #002b49; padding: 14px 30px; border: 1px solid #002b49; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                                                Access Client Dashboard
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>

            <tr>
                <td style="background-color: #f9f9f9; border-top: 1px solid #eeeeee; padding: 30px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="font-family: Arial, sans-serif; font-size: 11px; color: #666666; line-height: 1.6;">
                                <p style="margin: 0 0 10px 0; font-weight: bold; color: #002b49; text-transform: uppercase; letter-spacing: 1px;">Legal Advisor Inc.</p>
                                <p style="margin: 0 0 10px 0;">Level 5, Statesman House, Barakhamba Road, New Delhi - 110001</p>
                                <p style="margin: 0 0 15px 0;">
                                    You are receiving this confidential communication as a subscribed client.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="font-family: Arial, sans-serif; font-size: 11px; color: #999999;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pages/newsletter/preferences?token=${unsubscribeToken}" style="color: #666666; text-decoration: underline;">Preferences</a>
                                &nbsp;|&nbsp;
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color: #666666; text-decoration: underline;">Unsubscribe</a>
                                &nbsp;|&nbsp;
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/legal/privacy" style="color: #666666; text-decoration: underline;">Privacy Policy</a>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 15px; font-family: Arial, sans-serif; font-size: 10px; color: #bbbbbb;">
                                &copy; ${new Date().getFullYear()} LegalAdvisor. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

        </table>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td height="40" style="font-size: 0px; line-height: 0px;">&nbsp;</td>
            </tr>
        </table>
        
    </center>
</body>
</html>
    `;
}
