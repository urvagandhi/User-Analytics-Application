import { Schema, model, Document } from 'mongoose';
import { EventType } from '@causal-funnel/shared';

export interface IEventDocument extends Document {
  sessionId: string;
  eventType: EventType;
  pageUrl: string;
  timestamp: number;
  x?: number;
  y?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  xPct?: number;
  yPct?: number;
  userAgent: string;
  referrer?: string;
  elementSelector?: string;
  elementText?: string;
  tagName?: string;
  scrollDepth?: number;
  documentHeight?: number;
  urlPath?: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    sessionId: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: Object.values(EventType),
      required: true,
    },
    pageUrl: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    // Click-specific coordinates (optional)
    x: {
      type: Number,
      required: false,
    },
    y: {
      type: Number,
      required: false,
    },
    viewportWidth: {
      type: Number,
      required: false,
    },
    viewportHeight: {
      type: Number,
      required: false,
    },
    xPct: {
      type: Number,
      required: false,
    },
    yPct: {
      type: Number,
      required: false,
    },
    userAgent: {
      type: String,
      required: true,
    },
    referrer: {
      type: String,
      required: false,
    },
    elementSelector: {
      type: String,
      required: false,
    },
    elementText: {
      type: String,
      required: false,
    },
    tagName: {
      type: String,
      required: false,
    },
    scrollDepth: {
      type: Number,
      required: false,
    },
    documentHeight: {
      type: Number,
      required: false,
    },
    urlPath: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d', // 30-day TTL pruner
    },
  },
  {
    versionKey: false,
  }
);

// Indexes
EventSchema.index({ sessionId: 1, timestamp: 1 });
EventSchema.index({ pageUrl: 1, eventType: 1 });
EventSchema.index({ eventType: 1, timestamp: -1 });
EventSchema.index({ eventType: 1, scrollDepth: 1 });

export const EventModel = model<IEventDocument>('Event', EventSchema);
