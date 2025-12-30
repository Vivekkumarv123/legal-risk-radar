import { Feedback } from "@/models/feedback.model.js";

export const feedbackController = {
    // 1. CREATE FEEDBACK (Public – No Login)
    async createFeedback({ name, email, rating, message, isAnonymous = false }) {
        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        if (!message || message.trim().length === 0) {
            throw new Error("Feedback message is required");
        }

        const feedback = await Feedback.create({
            name: isAnonymous ? null : name,
            email: isAnonymous ? null : email,
            rating,
            message,
            isAnonymous,
        });

        return {
            success: true,
            message: "Feedback submitted successfully",
            feedbackId: feedback.id,
        };
    },

    // 2. GET ALL FEEDBACK (Admin / Internal use)
    async getAllFeedback() {
        const feedbackList = await Feedback.findAll();

        return {
            success: true,
            count: feedbackList.length,
            feedbacks: feedbackList,
        };
    },

    // 3. GET SINGLE FEEDBACK BY ID
    async getFeedbackById(feedbackId) {
        if (!feedbackId) throw new Error("Feedback ID is required");

        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) throw new Error("Feedback not found");

        return {
            success: true,
            feedback,
        };
    },

    // 4. DELETE FEEDBACK (Admin – Future use)
    async deleteFeedback(feedbackId) {
        if (!feedbackId) throw new Error("Feedback ID is required");

        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) throw new Error("Feedback not found");

        await Feedback.delete(feedbackId);

        return {
            success: true,
            message: "Feedback deleted successfully",
        };
    },
};
