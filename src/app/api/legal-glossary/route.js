import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';
import { glossaryTerms } from '@/data/glossary-terms';

// Use the comprehensive glossary data (300+ terms across 12 categories)
// Categories: Criminal Law, Civil Law, Contract Law, Corporate Law, Constitutional Law,
// Property Law, Family Law, Tax Law, Labour Law, Intellectual Property Law,
// Environmental Law, Cyber Law, Administrative Law
const glossaryData = glossaryTerms;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let filteredData = glossaryData;

        // Filter by category
        if (category && category !== 'All') {
            filteredData = filteredData.filter(term => term.category === category);
        }

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            filteredData = filteredData.filter(term =>
                term.term.toLowerCase().includes(searchLower) ||
                term.definition.toLowerCase().includes(searchLower)
            );
        }

        return NextResponse.json(filteredData);

    } catch (error) {
        console.error('Glossary API error:', error);
        return NextResponse.json({ error: 'Failed to fetch glossary data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;
        const usageCheck = await checkUsageLimit(userId, 'glossary_lookup');
        if (!usageCheck.allowed) {
            return NextResponse.json({
                error: usageCheck.message,
                upgradeMessage: usageCheck.upgradeMessage,
                upgradeRequired: usageCheck.upgradeRequired,
                limitType: usageCheck.limitType
            }, { status: 403 });
        }

        const { term } = await request.json();
        
        if (!term) {
            return NextResponse.json({ error: 'Term is required' }, { status: 400 });
        }

        // Find the specific term
        const foundTerm = glossaryData.find(
            item => item.term.toLowerCase() === term.toLowerCase()
        );

        if (!foundTerm) {
            return NextResponse.json({ error: 'Term not found' }, { status: 404 });
        }

        await trackUsage(userId, 'glossary_lookup');

        return NextResponse.json(foundTerm);

    } catch (error) {
        console.error('Glossary lookup error:', error);
        return NextResponse.json({ error: 'Failed to lookup term' }, { status: 500 });
    }
}
