import { PROGRESS_SEGMENTS } from './wizard-state';

const SEG = 'h-1 min-w-0 flex-1 rounded-full';

function segClass(i: number, current: number): string {
  if (i < current) return 'bg-create-progress-complete';
  if (i === current) return 'bg-create-progress-active';
  return 'bg-create-progress-track';
}

/**
 * Six-segment step indicator (Figma 1394:7998 et al.). Fills from the inline-end
 * (the reading start of the RTL-first composition): step 1 sits at the end, later
 * steps run toward the inline-start, so completed segments cluster on the end side
 * exactly as in Figma. `flex-row-reverse` puts segment 0 at the inline-end and
 * mirrors with the locale; the 6th lights only on the final submit.
 */
export function WizardProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div
      className="flex w-full max-w-[346px] flex-row-reverse items-center gap-[14px]"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={PROGRESS_SEGMENTS}
      aria-valuenow={Math.min(currentStep + 1, PROGRESS_SEGMENTS)}
    >
      {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
        <span key={i} className={`${SEG} ${segClass(i, currentStep)}`} />
      ))}
    </div>
  );
}
