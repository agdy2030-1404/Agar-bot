// modules/messages/template.model.js
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['greeting', 'info', 'price', 'location', 'availability', 'custom'],
        default: 'custom'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    useCount: {
        type: Number,
        default: 0
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
templateSchema.index({ userId: 1, category: 1 });
templateSchema.index({ userId: 1, isActive: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;