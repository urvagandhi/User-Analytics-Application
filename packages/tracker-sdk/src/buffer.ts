import { TrackingEvent } from '@causal-funnel/shared';

const BATCH_SIZE = 10;
let queue: TrackingEvent[] = [];

/**
 * Pushes a tracking event onto the in-memory buffer.
 * If the queue length meets or exceeds the batch size (10),
 * the provided onBatchLimitReached callback is executed.
 */
export function pushEvent(event: TrackingEvent, onBatchLimitReached?: () => void): void {
  queue.push(event);
  if (queue.length >= BATCH_SIZE && onBatchLimitReached) {
    onBatchLimitReached();
  }
}

/**
 * Retrieves all events currently stored in the queue and empties the queue.
 */
export function getAndClearEvents(): TrackingEvent[] {
  const events = [...queue];
  queue = [];
  return events;
}

/**
 * Returns the current count of buffered events.
 */
export function getQueueSize(): number {
  return queue.length;
}

/**
 * Peeks at the buffered events without clearing them.
 */
export function peekEvents(): TrackingEvent[] {
  return queue;
}
