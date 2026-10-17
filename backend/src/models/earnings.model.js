import mongoose from 'mongoose';

const EarningsSchema = new mongoose.Schema(
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
    periodOrDate: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      default: ''
    },
    grossEarnings: {
      type: Number,
      default: 0
    },
    platformDeductions: {
      type: Number,
      default: 0
    },
    workExpenses: {
      type: Number,
      default: 0
    },
    reportedPayout: {
      type: Number,
      default: null
    },
    calculatedNet: {
      type: Number,
      required: true
    },
    reconciliationNotes: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
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

// Compound index to guarantee unique earnings record ID per user
EarningsSchema.index({ userId: 1, id: 1 }, { unique: true });

export const Earnings = mongoose.models.Earnings || mongoose.model('Earnings', EarningsSchema);
