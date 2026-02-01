import { NextResponse } from 'next/server';
import { Chat, Message } from '@/models/chat.model';
import { SharedChat } from '@/models/sharedChat.model';
import { verifyToken } from '@/middleware/auth.middleware';
import { nanoid } from 'nanoid';

// Create a shared chat
export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chatId, title, settings = {} } = await request.json();

        if (!chatId) {
            return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
        }

        // Verify the chat belongs to the user
        const chat = await Chat.findById(chatId);
        if (!chat || chat.userId !== authResult.user.uid) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        // Generate unique share ID
        const shareId = nanoid(12);

        // Create shared chat record
        const sharedChatData = {
            originalChatId: chatId,
            userId: authResult.user.uid,
            title: title || chat.title || 'Shared Legal Consultation',
            shareId,
            isPublic: settings.isPublic !== false, // Default to true
            allowComments: settings.allowComments || false,
            expiresAt: settings.expiresAt ? new Date(settings.expiresAt) : null,
            viewCount: 0
        };

        const sharedChat = await SharedChat.create(sharedChatData);

        return NextResponse.json({
            success: true,
            shareId,
            shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${shareId}`,
            sharedChat
        });

    } catch (error) {
        console.error('Share chat error:', error);
        return NextResponse.json({ error: 'Failed to share chat' }, { status: 500 });
    }
}

// Get user's shared chats
export async function GET(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sharedChats = await SharedChat.findByUser(authResult.user.uid);

        return NextResponse.json({
            success: true,
            sharedChats
        });

    } catch (error) {
        console.error('Get shared chats error:', error);
        return NextResponse.json({ error: 'Failed to get shared chats' }, { status: 500 });
    }
}

// Update shared chat settings
export async function PUT(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { shareId, settings } = await request.json();

        if (!shareId) {
            return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
        }

        // Verify ownership
        const sharedChat = await SharedChat.findByShareId(shareId);
        if (!sharedChat || sharedChat.userId !== authResult.user.uid) {
            return NextResponse.json({ error: 'Shared chat not found or unauthorized' }, { status: 404 });
        }

        // Update settings
        const updateData = {};
        if (settings.isPublic !== undefined) updateData.isPublic = settings.isPublic;
        if (settings.allowComments !== undefined) updateData.allowComments = settings.allowComments;
        if (settings.expiresAt !== undefined) {
            updateData.expiresAt = settings.expiresAt ? new Date(settings.expiresAt) : null;
        }

        await SharedChat.update(shareId, updateData);

        return NextResponse.json({
            success: true,
            message: 'Shared chat updated successfully'
        });

    } catch (error) {
        console.error('Update shared chat error:', error);
        return NextResponse.json({ error: 'Failed to update shared chat' }, { status: 500 });
    }
}

// Delete shared chat
export async function DELETE(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const shareId = searchParams.get('shareId');

        if (!shareId) {
            return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
        }

        // Verify ownership
        const sharedChat = await SharedChat.findByShareId(shareId);
        if (!sharedChat || sharedChat.userId !== authResult.user.uid) {
            return NextResponse.json({ error: 'Shared chat not found or unauthorized' }, { status: 404 });
        }

        await SharedChat.delete(shareId);

        return NextResponse.json({
            success: true,
            message: 'Shared chat deleted successfully'
        });

    } catch (error) {
        console.error('Delete shared chat error:', error);
        return NextResponse.json({ error: 'Failed to delete shared chat' }, { status: 500 });
    }
}