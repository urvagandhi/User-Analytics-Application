import { Schema, model, Document } from 'mongoose';

export interface ISessionDocument extends Document {
  sessionId: string;
  userAgent: string;
  startedAt: Date;
  lastSeen: Date;
  totalEvents: number;
  pagesVisited: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    lastSeen: {
      type: Date,
      required: true,
    },
    totalEvents: {
      type: Number,
      required: true,
      default: 0,
    },
    pagesVisited: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true, // Manages createdAt and updatedAt automatically
    versionKey: false,
  }
);

// Extra index for dashboard session listings sorted by activity time
SessionSchema.index({ lastSeen: -1 });

export const SessionModel = model<ISessionDocument>('Session', SessionSchema);
