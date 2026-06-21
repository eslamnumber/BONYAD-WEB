import type { SketchIdeaArgs } from '../api/submit-idea';

export type BuildingType = 'apartment' | 'villa' | 'duplex' | 'compound' | 'shop';
export type ArchStyle = 'modern' | 'najdi' | 'hijazi' | 'contemporary';
export type PlotShape = 'rectangular' | 'l_shaped' | 'irregular';

export const BUILDING_TYPES: BuildingType[] = ['apartment', 'villa', 'duplex', 'compound', 'shop'];
export const ARCH_STYLES: ArchStyle[] = ['modern', 'najdi', 'hijazi', 'contemporary'];
export const PLOT_SHAPES: PlotShape[] = ['rectangular', 'l_shaped', 'irregular'];

export const AREA_MIN = 50;
export const AREA_MAX = 2000;
export const AREA_STEP = 10;

export type SketchFormState = {
  description: string;
  projectType: BuildingType;
  style: ArchStyle;
  area: number;
  bedrooms: number;
  bathrooms: number;
  plotEnabled: boolean;
  plotShape: PlotShape;
  plotWidth: number;
  plotLength: number;
  setbackFront: number;
  setbackBack: number;
  setbackLeft: number;
  setbackRight: number;
};

export const INITIAL_FORM: SketchFormState = {
  description: '',
  projectType: 'villa',
  style: 'modern',
  area: 300,
  bedrooms: 3,
  bathrooms: 2,
  plotEnabled: false,
  plotShape: 'rectangular',
  plotWidth: 20,
  plotLength: 15,
  setbackFront: 3,
  setbackBack: 3,
  setbackLeft: 2,
  setbackRight: 2,
};

/**
 * Map the form state to the strict `POST /api/sketch/idea` payload. Bedrooms /
 * bathrooms aren't first-class API fields, so they're folded into the description
 * (the backend parses them from natural language) via the pre-localised
 * `roomsClause`. The plot block is sent only when the user opts in.
 */
export function buildIdeaPayload(state: SketchFormState, roomsClause: string): SketchIdeaArgs {
  const description = [state.description.trim(), roomsClause.trim()].filter(Boolean).join(' — ');
  const payload: SketchIdeaArgs = {
    description,
    total_area_m2: state.area,
    project_type: state.projectType,
    style: state.style,
  };
  if (state.plotEnabled) {
    payload.plot = {
      shape: state.plotShape,
      dimensions_m: [state.plotWidth, state.plotLength],
      setbacks_m: {
        front: state.setbackFront,
        back: state.setbackBack,
        side_left: state.setbackLeft,
        side_right: state.setbackRight,
      },
    };
  }
  return payload;
}
