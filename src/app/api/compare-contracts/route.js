import { NextResponse } from 'next/server';
import { executeWithKeyRotation } from '@/lib/geminiKeyRotation';
import pdf2json from 'pdf2json';
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromPDF(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new pdf2json();

        pdfParser.on('pdfParser_dataError', reject);
        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfData.Pages.map(page =>
                page.Texts.map(text =>
                    decodeURIComponent(text.R[0].T)
                ).join(' ')
            ).join('\n');
            resolve(text);
        });

        pdfParser.parseBuffer(buffer);
    });
}

export async function POST(request) {
    try {
        // Verify authentication
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;

        // Check if user has access to contract comparison feature
        const usageCheck = await checkUsageLimit(userId, 'contract_comparison');
        if (!usageCheck.allowed) {
            return NextResponse.json({
                error: usageCheck.message,
                upgradeMessage: usageCheck.upgradeMessage,
                upgradeRequired: usageCheck.upgradeRequired,
                limitType: usageCheck.limitType
            }, { status: 403 });
        }

        const formData = await request.formData();
        const contract1 = formData.get('contract1');
        const contract2 = formData.get('contract2');

        if (!contract1 || !contract2) {
            return NextResponse.json({ error: 'Both contracts are required' }, { status: 400 });
        }

        // Extract text from both contracts
        const buffer1 = Buffer.from(await contract1.arrayBuffer());
        const buffer2 = Buffer.from(await contract2.arrayBuffer());

        const text1 = await extractTextFromPDF(buffer1);
        const text2 = await extractTextFromPDF(buffer2);

        // Use Gemini to compare contracts
        // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a legal contract analysis expert. Compare these two contracts in detail and provide a comprehensive analysis.

Contract 1:
${text1}

Contract 2:
${text2}

Analyze thoroughly and provide a structured comparison with:

1. **Missing Clauses** - Identify completely new or removed sections:
   - List clauses that exist in one contract but are completely absent in the other
   - Explain the significance (e.g., "This is a critical finding because...")
   - Include clause names and brief descriptions

2. **Different Terms** - Identify specific changes within existing clauses:
   - Jurisdiction changes (e.g., "England/Wales to Delaware/Texas")
   - Financial terms (fees, payment terms, late fees, etc.)
   - Dates and durations (contract terms, renewal periods)
   - Percentages and numerical values
   - Names, addresses, or entity types
   - Liability caps and time periods
   - For each difference, specify: what changed, from what value to what value

3. **Similar Clauses** - Identify clauses that remained substantially the same:
   - List core provisions that are unchanged
   - Include boilerplate clauses
   - Note any clauses with identical legal effect

Format your response as a JSON object with this structure:
{
    "missing_in_contract2": [
        {
            "title": "Force Majeure Clause",
            "description": "Complete clause text or summary",
            "significance": "Critical finding because it significantly changes the risk profile for both parties"
        }
    ],
    "missing_in_contract1": [
        {
            "title": "New Clause Title",
            "description": "Complete clause text or summary",
            "significance": "Explanation of why this matters"
        }
    ],
    "differences": [
        {
            "category": "Jurisdiction",
            "change": "Changed from England/Wales to Delaware/Texas",
            "impact": "This changes the legal framework entirely"
        },
        {
            "category": "Fees",
            "change": "Changed from £5,000 to $7,500",
            "impact": "Represents a currency and amount change"
        },
        {
            "category": "Payment Terms",
            "change": "Net 15 changed to Net 30",
            "impact": "Gives the client more time to pay"
        }
    ],
    "similar": [
        {
            "title": "Scope of Services",
            "description": "The actual work (social media, blog posts, SEO) is identical"
        },
        {
            "title": "Intellectual Property",
            "description": "The ownership rights (Client owns work upon payment) are unchanged"
        }
    ]
}

Return ONLY valid JSON, no markdown formatting.`;

        const result = await executeWithKeyRotation(async (genAI) => {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.3,
                },
            });

            return model.generateContent(prompt);
        });

        let text = result.response.text();
        console.log('Raw AI response:', text);

        // Remove markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        // Parse the JSON response
        let comparison;
        try {
            // Try to find JSON object in the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No JSON found in response:', text);
                throw new Error('Invalid response format from AI');
            }
            comparison = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Text that failed to parse:', text);
            throw new Error('Failed to parse AI response as JSON');
        }

        // Track usage after successful comparison
        await trackUsage(userId, 'contract_comparison');

        // Format the response with structured data
        return NextResponse.json({
            success: true,
            missing_in_contract2: comparison.missing_in_contract2 || [],
            missing_in_contract1: comparison.missing_in_contract1 || [],
            differences: comparison.differences || [],
            similar: comparison.similar || [],
            // Legacy format for backward compatibility
            missing: [
                ...(comparison.missing_in_contract1 || []).map(item => 
                    typeof item === 'string' ? item : `${item.title}: ${item.description}`
                ),
                ...(comparison.missing_in_contract2 || []).map(item => 
                    typeof item === 'string' ? item : `${item.title}: ${item.description}`
                )
            ]
        });

    } catch (error) {
        console.error('Contract comparison error:', error);
        return NextResponse.json({ error: 'Failed to compare contracts' }, { status: 500 });
    }
}