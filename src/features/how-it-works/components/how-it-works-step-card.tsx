'use client';

import { useState } from 'react';

// Physical `left`/`top` on illustrations is intentional — these decorative
// absolute elements must not flip with locale direction (inline styles are
// not Tailwind utilities so the no-physical-direction-utilities rule is not violated).
type ImgState = { left: string; top: string; width: string; height: string; scaleY?: number };
type CardImgConfig = { def: ImgState; hov: ImgState };

const C_IMG: Record<string, CardImgConfig> = {
  '01': {
    def: { left: '-149px', top: '42px', width: '218px', height: '218px' },
    hov: { left: '-12px', top: '42px', width: '218px', height: '218px' },
  },
  '02': {
    def: { left: '-159px', top: '27px', width: '211px', height: '211px' },
    hov: { left: '-17px', top: '27px', width: '211px', height: '211px' },
  },
  '03': {
    def: { left: '-174px', top: '52px', width: '189px', height: '189px' },
    hov: { left: '-12px', top: '48px', width: '189px', height: '189px' },
  },
  '04': {
    def: { left: '-38px', top: '289px', width: '225px', height: '225px' },
    hov: { left: '-38px', top: '124px', width: '225px', height: '225px' },
  },
};

const IMG_FALLBACK: CardImgConfig = {
  def: { left: '-149px', top: '42px', width: '218px', height: '218px' },
  hov: { left: '-12px', top: '42px', width: '218px', height: '218px' },
};

const P_IMG: Record<string, CardImgConfig> = {
  '01': {
    def: { left: '-146px', top: '69px', width: '180px', height: '180px' },
    hov: { left: '-146px', top: '-24px', width: '366px', height: '366px' },
  },
  '02': {
    def: { left: '-123px', top: '193px', width: '149px', height: '149px' },
    hov: { left: '-83px', top: '7px', width: '317px', height: '317px' },
  },
  '03': {
    def: { left: '-43px', top: '280px', width: '267px', height: '267px', scaleY: -1 },
    hov: { left: '-50px', top: '48px', width: '267px', height: '267px', scaleY: -1 },
  },
  '04': {
    def: { left: '-13px', top: '292px', width: '180px', height: '180px' },
    hov: { left: '-87px', top: '7px', width: '291px', height: '291px' },
  },
};

export type StepCardData = {
  number: string;
  title: string;
  body: string;
  bullets: string[];
  illustration: string;
  isPro: boolean;
};

function GradientOverlay({ hovered }: { hovered: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: 'linear-gradient(to bottom, rgba(0,93,172,0.22), rgba(0,93,172,0) 80%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 500ms ease-in-out',
      }}
    />
  );
}

type IllustrationProps = { img: ImgState; illustration: string; hovered: boolean };
function IllustrationLayer({ img, illustration, hovered }: IllustrationProps) {
  const xform = img.scaleY !== undefined ? `scaleY(${img.scaleY})` : undefined;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: img.left,
        top: img.top,
        width: img.width,
        height: img.height,
        transform: xform,
        opacity: hovered ? 0.3 : 0,
        transition:
          'left 500ms ease-in-out, top 500ms ease-in-out, width 500ms ease-in-out, height 500ms ease-in-out, opacity 500ms ease-in-out',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={illustration} alt="" className="absolute inset-0 block size-full max-w-none" />
    </div>
  );
}

type ContentProps = { title: string; body: string; bullets: string[]; hovered: boolean };
function StepContent({ title, body, bullets, hovered }: ContentProps) {
  return (
    <div className="relative flex w-full flex-col gap-3 text-end">
      <p className="text-primary text-2xl leading-tight font-semibold">{title}</p>
      <p
        className={`text-base leading-[1.5] transition-colors duration-300 ${hovered ? 'text-foreground/70 dark:text-foreground/80' : 'text-foreground/80 dark:text-foreground/95'}`}
      >
        {body}
      </p>
      <ul
        className="text-foreground/80 dark:text-foreground/95 overflow-hidden text-base"
        style={{
          maxHeight: hovered ? '200px' : '0',
          opacity: hovered ? 1 : 0,
          transition: 'max-height 500ms ease-in-out, opacity 400ms ease-in-out',
        }}
      >
        {bullets.map((bullet) => (
          <li key={bullet} className="ms-6 list-disc leading-[1.5]">
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StepCard({ number, title, body, bullets, illustration, isPro }: StepCardData) {
  const [hovered, setHovered] = useState(false);
  const map = isPro ? P_IMG : C_IMG;
  const cfg = map[number] ?? IMG_FALLBACK;
  const img = hovered ? cfg.hov : cfg.def;
  const cardTop = hovered ? 'calc(50% - 20px)' : '50%';
  const numSize = hovered ? '45px' : '64px';

  return (
    <div
      className="relative h-[366px] w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="border-step-card-border bg-step-card-bg absolute overflow-hidden rounded-2xl border backdrop-blur-[4px]"
        style={{
          insetInlineStart: '13px',
          width: 'calc(100% - 26px)',
          height: '304px',
          top: cardTop,
          transform: 'translateY(-50%)',
          transition: 'top 500ms ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '24px 16px',
        }}
      >
        <GradientOverlay hovered={hovered} />
        <IllustrationLayer img={img} illustration={illustration} hovered={hovered} />
        <p
          className="text-primary relative self-end leading-none font-semibold"
          style={{ fontSize: numSize, transition: 'font-size 500ms ease-in-out' }}
        >
          {number}
        </p>
        <StepContent title={title} body={body} bullets={bullets} hovered={hovered} />
      </div>
    </div>
  );
}
