import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    id: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      default: 'Other'
    },
    platform: {
      type: String,
      default: ''
    },
    subject: {
      type: String,
      default: ''
    },
    complaintDraft: {
      type: String,
      default: ''
    },
    complaintDraftEnglish: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en'
    },
    status: {
      type: String,
      enum: ['Draft', 'Saved', 'Copied', 'Resolved'],
      default: 'Saved'
    },
    providedFacts: {
      type: [String],
      default: []
    },
    missingDetails: {
      type: [String],
      default: []
    },
    recommendedNextSteps: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.mongoId = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index to guarantee unique case ID per user
CaseSchema.index({ userId: 1, id: 1 }, { unique: true });

export const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);
