import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf2json from 'pdf2json';
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `
        Compare these two contracts and identify:
        1. Clauses present in Contract 1 but missing in Contract 2
        2. Clauses present in Contract 2 but missing in Contract 1
        3. Clauses that exist in both but have different terms
        4. Similar clauses that are substantially the same

        Contract 1:
        ${text1}

        Contract 2:
        ${text2}

        Please provide the response in JSON format with the following structure:
        {
            "missing_in_contract2": ["clause1", "clause2"],
            "missing_in_contract1": ["clause1", "clause2"],
            "differences": ["difference1", "difference2"],
            "similar": ["similar_clause1", "similar_clause2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }
        
        const comparison = JSON.parse(jsonMatch[0]);

        // Track usage after successful comparison
        await trackUsage(userId, 'contract_comparison');
        
        return NextResponse.json({
            success: true,
            missing: [...(comparison.missing_in_contract1 || []), ...(comparison.missing_in_contract2 || [])],
            differences: comparison.differences || [],
            similar: comparison.similar || []
        });

    } catch (error) {
        console.error('Contract comparison error:', error);
        return NextResponse.json({ error: 'Failed to compare contracts' }, { status: 500 });
    }
}