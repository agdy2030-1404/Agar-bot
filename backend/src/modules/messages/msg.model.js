// modules/messages/msg.model.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    senderName: {
        type: String,
        required: true
    },
    senderNumber: {
        type: String,
        default: ''
    },
    messageContent: {
        type: String,
        default: ''
    },
    adId: {
        type: String,
        required: true
    },
    adTitle: {
        type: String,
        default: ''
    },
    receivedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    },
    replySent: {
        type: Boolean,
        default: false
    },
    replyContent: {
        type: String,
        default: ''
    },
    repliedAt: {
        type: Date,
        default: null
    },
    replyMethod: {
        type: String,
        enum: ['whatsapp', 'sms', 'internal', 'none'],
        default: 'none'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// فهرس للبحث السريع
messageSchema.index({ messageId: 1, userId: 1 });
messageSchema.index({ userId: 1, status: 1 });
messageSchema.index({ receivedAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;