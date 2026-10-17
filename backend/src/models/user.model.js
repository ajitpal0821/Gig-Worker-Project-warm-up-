import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, dots, underscores, and dashes'],
      set: (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val)
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);


// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash password
UserSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
