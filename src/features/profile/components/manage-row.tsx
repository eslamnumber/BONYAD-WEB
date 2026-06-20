import { type ComponentType, type ReactNode, type SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One Manage-card row body (Figma 1674:7964): a leading expand/drill chevron at the
 * inline-start, the title + subtitle stacked toward the inline-end, and the row's
 * bare icon at the inline-end. The chevron is injected so the same row works as an
 * accordion trigger (a rotating `ChevronDown`) or a navigation link (a drill-in
 * `ChevronLeft`). Fixed 64 px height matches the Figma row.
 */
export function ManageRow({
  Icon,
  title,
  subtitle,
  chevron,
}: {
  Icon: IconComponent;
  title: string;
  subtitle: string;
  chevron: ReactNode;
}) {
  return (
    <div className="flex h-16 w-full items-center justify-between px-4">
      {chevron}
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex min-w-0 flex-col items-end gap-1 text-end">
          <span className="text-foreground max-w-full truncate text-base font-medium">{title}</span>
          <span className="text-muted-foreground max-w-full truncate text-xs">{subtitle}</span>
        </div>
        <Icon className="text-muted-foreground size-6 shrink-0" aria-hidden />
      </div>
    </div>
  );
}
