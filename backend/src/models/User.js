import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

const { Schema, model } = mongoose;

export const ROLES = ['ADMIN', 'EDITOR', 'VIEWER'];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, trim: true },
    // Absent for accounts created through Google sign-in (they have no password).
    passwordHash: { type: String, default: null, select: false },
    role: { type: String, enum: ROLES, default: 'VIEWER' },
    // How the account was created / can sign in.
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleUid: { type: String, default: null, index: true, sparse: true },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, config.bcryptRounds);
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

/** True when the account can only sign in with Google (no password set). */
userSchema.methods.isGoogleOnly = function isGoogleOnly() {
  return !this.passwordHash && Boolean(this.googleUid);
};

/** True when the stored hash uses a higher cost than configured (slow on small hosts). */
userSchema.methods.needsRehash = function needsRehash() {
  if (!this.passwordHash) return false;
  try {
    return bcrypt.getRounds(this.passwordHash) > config.bcryptRounds;
  } catch {
    return false;
  }
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name ?? null,
    role: this.role,
    provider: this.provider ?? 'local',
    avatar: this.avatar || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = model('User', userSchema);
