import { executeWithKeyRotation } from "@/lib/geminiKeyRotation";
import { db } from "@/lib/firebaseAdmin";

/**
 * Get day-of-week theme for newsletter
 */
export function getTodayTheme(date = new Date()) {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const themes = {
        0: "Tax, Financial Regulations & Legal Technology Trends",
        1: "Corporate & Startup Law, Contracts & M&A",
        2: "Consumer Rights, E-Commerce & Consumer Protection",
        3: "Cyber Law, AI Regulations & Data Privacy (DPDP Act)",
        4: "Property, Real Estate & RERA Regulations",
        5: "Labour, Employment & Workplace Regulations",
        6: "Supreme Court, High Courts & Tribunal Decisions"
    };
    return themes[day] || "Indian Legal System Updates";
}

/**
 * Get recent newsletter topics from Firestore (last N days)
 */
export async function getRecentNewsletterTopics(days = 7) {
    try {
        if (!db) return [];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const snapshot = await db.collection('newsletter_history')
            .where('generatedAt', '>=', cutoff)
            .orderBy('generatedAt', 'desc')
            .limit(15)
            .get();

        if (snapshot.empty) return [];

        const topics = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.headline) topics.push(data.headline);
            if (Array.isArray(data.topics)) {
                topics.push(...data.topics);
            }
        });

        return [...new Set(topics)]; // Return unique topics
    } catch (error) {
        console.error('Error fetching recent newsletter topics:', error);
        return [];
    }
}

/**
 * Save generated newsletter metadata to Firestore history
 */
export async function saveNewsletterHistory({ type = 'daily', theme = '', headline = '', topics = [], summary = '', content = '' }) {
    try {
        if (!db) return;
        await db.collection('newsletter_history').add({
            type,
            theme,
            headline,
            topics,
            summary: summary || headline,
            generatedAt: new Date(),
            contentLength: content ? content.length : 0
        });
        console.log(`✅ Saved ${type} newsletter metadata to history`);
    } catch (error) {
        console.error('Failed to save newsletter history:', error);
    }
}

/**
 * Generate daily legal newsletter content using Gemini AI with key rotation
 */
export async function generateDailyNewsletter() {
    try {
        const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const theme = getTodayTheme();
        const recentTopics = await getRecentNewsletterTopics(7);

        const result = await executeWithKeyRotation(async (ai) => {
            const recentTopicsConstraint = recentTopics.length > 0
                ? `\nRECENTLY COVERED TOPICS (DO NOT REPEAT THESE):\n${recentTopics.map(t => `- ${t}`).join('\n')}\n`
                : '';

            const prompt = `Generate a super crisp, ultra-concise 60-second daily legal briefing for ${todayDateStr}.

PRIMARY THEME TODAY: ${theme}
${recentTopicsConstraint}
STRICT LENGTH CONSTRAINT: Maximum 150-180 words TOTAL for the ENTIRE newsletter.
Keep every sentence short, impactful, and easy to read on a mobile phone.

SECTIONS (Keep content brief and minimal):

1. **📰 Top Story** (Max 2 sentences)
   - One key Indian legal development today & why it matters.

2. **⚡ Quick Hits** (Exactly 2 short bullet points, 1 sentence each)
   - Two brief legal updates.

3. **💡 Actionable Tip** (Max 1 sentence)
   - One quick practical tip.

RULES:
- Total word count MUST NOT exceed 180 words.
- Use simple plain English without legalese.
- No long paragraphs or walls of text.`;

            let response;
            let usedGrounding = true;

            // Attempt 1: With Google Search Grounding
            try {
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        temperature: 0.85,
                        tools: [{ googleSearch: {} }]
                    }
                });
            } catch (groundingError) {
                console.warn('⚠️ Search Grounding failed, falling back to standard generation:', groundingError.message);
                usedGrounding = false;
                // Attempt 2: Fallback without search grounding
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        temperature: 0.85
                    }
                });
            }

            const content = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // Extract headline from content
            const headlineMatch = content.match(/\*\*📰 Top Story\*\*[\s\S]*?(?:Headline:|Case:|-)?\s*([^\n]+)/i);
            const headline = headlineMatch ? headlineMatch[1].replace(/[*#]/g, '').trim() : `Daily Legal Update - ${todayDateStr}`;

            // Save metadata to history
            await saveNewsletterHistory({
                type: 'daily',
                theme,
                headline,
                topics: [headline, theme],
                summary: `Daily newsletter for ${todayDateStr} (${theme})`,
                content
            });

            return {
                success: true,
                content,
                generatedAt: new Date(),
                grounded: usedGrounding,
                theme,
                title: `Legal Newsletter - ${todayDateStr}`
            };
        });

        return result;
    } catch (error) {
        console.error('Error generating daily newsletter:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate weekly legal roundup digest
 */
export async function generateWeeklyNewsletter() {
    try {
        const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const recentTopics = await getRecentNewsletterTopics(7);

        const result = await executeWithKeyRotation(async (ai) => {
            const prompt = `Generate a crisp, high-impact 2-minute Weekly Legal Digest for the week ending ${todayDateStr}.

${recentTopics.length > 0 ? `RECENT TOPICS OF INTEREST:\n${recentTopics.map(t => `- ${t}`).join('\n')}\n` : ''}

STRICT LENGTH CONSTRAINT: Maximum 250-300 words TOTAL for the ENTIRE digest.

SECTIONS:

1. **📰 Top 3 Weekly Highlights** (1 short sentence each)
   - The 3 biggest legal developments in India this week.

2. **⚖️ Major Ruling / Policy Shift** (Max 3 sentences)
   - Key Supreme Court/High Court judgment or government notification.

3. **💡 Compliance & Deadline Alert** (Max 2 sentences)
   - Key upcoming deadline or actionable compliance tip.

RULES:
- Total word count MUST NOT exceed 300 words.
- Super scannable, mobile-friendly layout with bullet points and bold section headers.
- Practical focus on Indian Law.`;

            let response;
            let usedGrounding = true;

            try {
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        temperature: 0.8,
                        tools: [{ googleSearch: {} }]
                    }
                });
            } catch (err) {
                console.warn('⚠️ Search Grounding failed for weekly newsletter, falling back:', err.message);
                usedGrounding = false;
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        temperature: 0.8
                    }
                });
            }

            const content = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";

            await saveNewsletterHistory({
                type: 'weekly',
                theme: 'Weekly Legal Roundup Digest',
                headline: `Weekly Legal Digest - ${todayDateStr}`,
                topics: recentTopics,
                summary: `Weekly digest for ${todayDateStr}`,
                content
            });

            return {
                success: true,
                content,
                generatedAt: new Date(),
                grounded: usedGrounding,
                title: `Weekly Legal Digest - ${todayDateStr}`
            };
        });

        return result;
    } catch (error) {
        console.error('Error generating weekly newsletter:', error);
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
        const result = await executeWithKeyRotation(async (ai) => {
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

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            const content = response.text;

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
                                <div style="font-size: 36px; line-height: 1; margin-bottom: 10px; color: #002b49;">⚖️</div>
                                <h1 class="header-text serif" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #002b49; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; border-bottom: 2px solid #d4af37; padding-bottom: 15px; display: inline-block;">
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
