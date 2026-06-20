import { PUBLISH_TRIGGER } from './ai-constants';
import { createPhasesFromSow } from './create-phase';
import { createProjectFromAi, projectIdOf } from './create-project-from-ai';
import { fetchServices, matchService } from './match-service';
import { saveAiDraft } from './save-ai-draft';
import { sendWizardMessage } from './send-wizard-message';
import type { SowDocument } from './sow-types';
import { uploadAttachments } from './upload-attachment';

export type PublishErrorKind = 'no-service' | 'create-failed';

export class PublishFailure extends Error {
  constructor(public readonly kind: PublishErrorKind) {
    super(kind);
    this.name = 'PublishFailure';
  }
}

export type PublishInput = {
  sow: SowDocument;
  conversationId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  photos: File[];
  locale: string;
};

export type PublishResult = { projectId: number; phasesCreated: number; photosUploaded: number };

/**
 * Publish a generated SOW as a real project (iOS publish sequence, web-adapted):
 * finalize the wizard (DONE trigger) → match the service → create the project →
 * then best-effort phases, photo uploads, and the analytics draft. The create call
 * is the only hard gate: a null service match or a missing project id throws a
 * typed {@link PublishFailure} so the UI can show the right error. The trailing
 * steps never block success (they swallow their own errors).
 */
export async function runPublish(input: PublishInput): Promise<PublishResult> {
  // 5a — flip the backend to the DONE stage (best-effort; never blocks publish).
  await sendWizardMessage({ message: PUBLISH_TRIGGER, conversationId: input.conversationId }).catch(
    () => null,
  );

  // 5b — resolve the service (mandatory serviceId).
  const services = await fetchServices().catch(() => []);
  const match = matchService(input.sow, services);
  if (!match) throw new PublishFailure('no-service');

  // 5c — create the project.
  let projectId: number | undefined;
  try {
    const res = await createProjectFromAi({
      sow: input.sow,
      match,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      conversationId: input.conversationId,
      locale: input.locale,
    });
    projectId = projectIdOf(res);
  } catch {
    throw new PublishFailure('create-failed');
  }
  if (!projectId) throw new PublishFailure('create-failed');

  // 5d–5f — best-effort, non-blocking.
  const phasesCreated = await createPhasesFromSow(projectId, input.sow);
  const photosUploaded = input.photos.length ? await uploadAttachments(projectId, input.photos) : 0;
  await saveAiDraft(input.sow, input.conversationId);

  return { projectId, phasesCreated, photosUploaded };
}
