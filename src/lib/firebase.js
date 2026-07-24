/**
 * Client-side Firebase/Firestore Client Wrapper
 * Exposes methods to sync and fetch data from the Next.js API endpoints.
 * This secures Firestore operations and uses the Firebase Admin SDK on the backend.
 */

const API_BASE = '/api/consultation';

/**
 * Creates a new consultation session.
 * @param {string} userId - The ID of the authenticated user.
 * @returns {Promise<Object>} The created consultation document.
 */
export async function createConsultation(userId) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create consultation');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating consultation:', error);
    throw error;
  }
}

/**
 * Fetches a consultation session by ID.
 * @param {string} consultationId - The ID of the consultation.
 * @returns {Promise<Object>} The consultation document.
 */
export async function getConsultation(consultationId) {
  try {
    const res = await fetch(`${API_BASE}/${consultationId}`);
    
    if (!res.ok) {
      if (res.status === 404) return null;
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch consultation');
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching consultation:', error);
    throw error;
  }
}

/**
 * Appends a message to the live transcript.
 * @param {string} consultationId - The active consultation ID.
 * @param {Object} message - The message object { sender: 'user'|'model', text: string }.
 * @returns {Promise<Object>} The updated consultation document.
 */
export async function syncTranscript(consultationId, message) {
  return await syncSession(consultationId, { transcript: message });
}

/**
 * Appends an event to the consultation timeline.
 * @param {string} consultationId - The active consultation ID.
 * @param {string} eventText - The title of the event.
 * @returns {Promise<Object>} The updated consultation document.
 */
export async function syncTimelineEvent(consultationId, eventText) {
  return await syncSession(consultationId, {
    timelineEvent: {
      event: eventText,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Saves the final decision brief.
 * @param {string} consultationId - The active consultation ID.
 * @param {Object} decisionBrief - The decision brief object.
 * @returns {Promise<Object>} The updated consultation document.
 */
export async function saveDecisionBrief(consultationId, decisionBrief) {
  return await syncSession(consultationId, { status: 'completed', decisionBrief });
}

/**
 * Core helper to push data mutations to the server.
 * @param {string} consultationId - The active consultation ID.
 * @param {Object} payload - The fields to update or append.
 */
async function syncSession(consultationId, payload) {
  try {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId, ...payload }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sync session');
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error syncing session:', error);
    throw error;
  }
}
