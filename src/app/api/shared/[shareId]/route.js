import { NextResponse } from 'next/server';
import { Chat, Message } from '@/models/chat.model';
import { SharedChat } from '@/models/sharedChat.model';

export async function GET(request, { params }) {
    try {
        const { shareId } = await params;

        if (!shareId) {
            return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
        }

        // Find the shared chat
        const sharedChat = await SharedChat.findByShareId(shareId);
        if (!sharedChat) {
            return NextResponse.json({ error: 'Shared chat not found' }, { status: 404 });
        }

        // Check if expired
        if (SharedChat.isExpired(sharedChat)) {
            return NextResponse.json({ error: 'This shared chat has expired' }, { status: 410 });
        }

        // Check if public
        if (!sharedChat.isPublic) {
            return NextResponse.json({ error: 'This shared chat is private' }, { status: 403 });
        }

        // Get the original chat and messages
        const originalChat = await Chat.findById(sharedChat.originalChatId);
        if (!originalChat) {
            return NextResponse.json({ error: 'Original chat not found' }, { status: 404 });
        }

        const messages = await Message.findByChatId(sharedChat.originalChatId);

        // Increment view count (fire and forget)
        SharedChat.incrementViewCount(shareId).catch(console.error);

        // Sanitize data for public sharing
        // The message shape was recently extended to include `displayContent`
        // and the frontend expects both the full `content` and a shorter
        // `displayContent` (for previews). Also accept alternate field names
        // that may have been used when saving (fileUrl, analysis).
        const sanitizedMessages = messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            // Full content (may be long, includes detailed analysis text)
            content: msg.content || msg.displayContent || '',
            // Short or user-facing content for UI previews
            displayContent: msg.displayContent || msg.content || '',
            // Attachment / uploaded file URL (accept multiple possible names)
            attachmentUrl: msg.attachmentUrl || msg.fileUrl || null,
            // Structured AI analysis (may be an object)
            analysisData: msg.analysisData || msg.analysis || null,
            createdAt: msg.createdAt
        }));
        console.log(sanitizedMessages);
        return NextResponse.json({
            success: true,
            sharedChat: {
                shareId: sharedChat.shareId,
                title: sharedChat.title,
                createdAt: sharedChat.createdAt,
                viewCount: sharedChat.viewCount + 1, // Include the current view
                allowComments: sharedChat.allowComments
            },
            messages: sanitizedMessages
        });

    } catch (error) {
        console.error('Get shared chat error:', error);
        return NextResponse.json({ error: 'Failed to get shared chat' }, { status: 500 });
    }
}