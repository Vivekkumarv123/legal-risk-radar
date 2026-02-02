// src/utils/greetingHandler.js

const GREETINGS = {
  general: [
    // Basic
    "hi", "hello", "hey", "heyy", "hii", "hiii", "helloo", "helo",

    // Casual / slang
    "yo", "yoo", "sup", "wassup", "what up", "whats up", "what's up",
    "howdy", "hiya", "hey there", "hi there",

    // Polite / formal
    "greetings", "good day", "good to see you", "pleased to meet you",

    // Global / Indian
    "namaste", "namaskar", "hola", "bonjour", "ciao",

    // Conversational
    "how are you", "how r u", "how you doing", "how do you do",
    "hope you are well", "hope you're doing well",

    // Casual phrases
    "long time no see", "nice to see you", "great to see you",

    // Hinglish / casual
    "hi bro", "hello bro", "hey bro", "hello sir", "hi sir"
  ],

  morning: [
    "gm", "good morning", "morning", "good morn", "morning buddy",
    "morning bro", "good morning sir", "gm bro", "gm sir"
  ],

  afternoon: [
    "ga", "good afternoon", "afternoon", "good after noon",
    "afternoon sir", "afternoon bro"
  ],

  evening: [
    "good evening", "evening", "evening bro", "evening sir",
    "good eve", "eve"
  ],

  night: [
    "gn", "good night", "night", "nite", "good nite",
    "night bro", "night sir", "sleep well", "sweet dreams"
  ],

  emojis: [
    "👋", "🙏", "😊", "🙂", "😄", "😁", "🙋", "🙌"
  ]
};

// Normalize text aggressively
const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s👋🙏😊🙂😄😁🙋🙌]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Flatten all greetings into one list (100+)
const ALL_GREETINGS = Object.values(GREETINGS).flat();

export const isGreeting = (text) => {
  const normalized = normalizeText(text);
  
  // Exclude common false positives
  const falsePositives = ['hindi', 'history', 'this', 'think', 'thing'];
  if (falsePositives.some(fp => normalized.includes(fp))) {
    return false;
  }
  
  // More precise matching - check for word boundaries
  const isMatch = ALL_GREETINGS.some(greet => {
    // For single words like "hi", "hello", check if it's the whole message or at word boundaries
    if (greet.length <= 3) {
      // Short greetings should match exactly or be at the start/end with word boundaries
      const regex = new RegExp(`\\b${greet}\\b`, 'i');
      return regex.test(normalized) && normalized.length <= 20; // Limit to short messages
    } else {
      // Longer greetings can use includes
      return normalized === greet || normalized.includes(greet);
    }
  });

  return isMatch;
};

export const getGreetingResponse = (text) => {
  const normalized = normalizeText(text);

  if (GREETINGS.morning.some(g => normalized.includes(g))) {
    return "Good morning! Ready to analyze some legal documents today?";
  }

  if (GREETINGS.afternoon.some(g => normalized.includes(g))) {
    return "Good afternoon! How can I assist you with legal insights?";
  }

  if (GREETINGS.evening.some(g => normalized.includes(g))) {
    return "Good evening! Need help reviewing a contract or agreement?";
  }

  if (GREETINGS.night.some(g => normalized.includes(g))) {
    return "Good night! I’m always here if you need legal assistance later.";
  }

  return "Hello! I’m your AI Legal Advisor. Upload a document or ask a legal question to get started.";
};
