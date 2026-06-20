/** Minimal translation function shape — passed to presentational SOW sections so they stay hook-free. */
export type T = (key: string, options?: Record<string, unknown>) => string;

/** Top-level screens of the Omdah SOW flow (refine is a sub-state of `review`). */
export type FlowStep =
  | 'generating'
  | 'review'
  | 'publishAddress'
  | 'publishReview'
  | 'publishing'
  | 'success'
  | 'error';

/** Which error face to show (offline · generation failed · service unresolved · create failed). */
export type FlowErrorKind = 'offline' | 'generation' | 'publish-service' | 'publish-failed';

/** Location + photos gathered on the publish-address screen. */
export type PublishDraft = {
  address: string;
  latitude?: number;
  longitude?: number;
  photos: File[];
};
