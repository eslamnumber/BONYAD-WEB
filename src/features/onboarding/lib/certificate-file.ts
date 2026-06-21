/**
 * Certificate / licence upload constraints for the "Complete your profile" screen.
 * The field is OPTIONAL (mirrors the iOS screen) and accepts images + documents. We
 * validate type/size/count on the client and reject with a clear message — heavy
 * image compression (the iOS 800 KB pass) is intentionally deferred.
 */
export const ACCEPTED_CERTIFICATE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'pdf',
  'doc',
  'docx',
] as const;

/** The `accept` attribute for the file input, derived from the allowed extensions. */
export const CERTIFICATE_ACCEPT = ACCEPTED_CERTIFICATE_EXTENSIONS.map((e) => `.${e}`).join(',');

export const MAX_CERTIFICATES = 10;
export const MAX_CERTIFICATE_BYTES = 10 * 1024 * 1024; // 10 MB

export type CertificateError =
  | 'onboarding.completeProfile.errors.fileType'
  | 'onboarding.completeProfile.errors.fileSize';

/** Validate one file; returns an i18n error key, or `null` when the file is acceptable. */
export function validateCertificate(file: File): CertificateError | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!(ACCEPTED_CERTIFICATE_EXTENSIONS as readonly string[]).includes(ext)) {
    return 'onboarding.completeProfile.errors.fileType';
  }
  if (file.size > MAX_CERTIFICATE_BYTES) return 'onboarding.completeProfile.errors.fileSize';
  return null;
}
