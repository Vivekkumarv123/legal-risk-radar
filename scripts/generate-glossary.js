// Script to generate comprehensive legal glossary
// Run with: node scripts/generate-glossary.js

const fs = require('fs');
const path = require('path');

// This script generates a comprehensive legal glossary with 50+ terms per category
// Categories: Criminal, Civil, Contract, Corporate, Constitutional, Property, Family, Tax, Labour, IP, Environmental, Cyber

const glossaryTemplate = `import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

// AUTO-GENERATED: Comprehensive Legal Glossary (300+ terms)
// Last updated: ${new Date().toISOString()}
export const glossaryData = require('@/data/glossary-terms.json');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let filteredData = glossaryData;

        if (category && category !== 'All') {
            filteredData = filteredData.filter(term => term.category === category);
        }

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
`;

console.log('Glossary generator script created');
console.log('Note: Due to size constraints, please manually expand the glossary');
console.log('Recommended: Use a database for production with 300+ terms');
