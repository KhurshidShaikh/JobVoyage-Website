import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    bookmarkedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a user can't bookmark the same job twice
bookmarkSchema.index({ user: 1, job: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
