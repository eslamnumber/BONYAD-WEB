import { describe, expect, it } from 'vitest';

import { type OwnerEditFormValues, type OwnerEditResponse } from '../schemas/owner-edit';

import {
  buildOwnerEditFormData,
  formValuesToPayload,
  responseToFormValues,
} from './owner-edit-mapping';

const baseForm: OwnerEditFormValues = {
  name: 'Villa',
  description: 'Build a villa',
  budgetUnspecified: false,
  budget: '250000',
  address: 'Riyadh',
  existingPhotos: [],
  phases: [],
};

describe('responseToFormValues', () => {
  it('splits the stored "name\\n\\ndescription" blob and maps budget + photos', () => {
    const res: OwnerEditResponse = {
      project: {
        description: 'Riyadh Villa\n\nA detailed scope of work.',
        budget: 250000,
        address: 'Riyadh',
        files: ['a.jpg', 'b.jpg'],
      },
      phases: [],
    };
    const form = responseToFormValues(res);
    expect(form.name).toBe('Riyadh Villa');
    expect(form.description).toBe('A detailed scope of work.');
    expect(form.budgetUnspecified).toBe(false);
    expect(form.budget).toBe('250000');
    expect(form.existingPhotos).toEqual(['a.jpg', 'b.jpg']);
  });

  it('leaves the name blank and keeps everything as description when there is no newline', () => {
    const form = responseToFormValues({ project: { description: 'Just a description' } });
    expect(form.name).toBe('');
    expect(form.description).toBe('Just a description');
  });

  it('marks budget unspecified when the backend has 0 / null', () => {
    expect(responseToFormValues({ project: { budget: 0 } }).budgetUnspecified).toBe(true);
    expect(responseToFormValues({ project: { budget: null } }).budget).toBe('');
  });

  it('converts phase days → whole weeks and falls back to the index for phaseNumber', () => {
    const form = responseToFormValues({
      phases: [{ id: 5, description: 'Foundations', timeSpentDays: 21, moneySpent: 100000 }],
    });
    expect(form.phases[0]).toEqual({
      id: 5,
      phaseNumber: '1',
      description: 'Foundations',
      durationWeeks: '3',
      amount: '100000',
    });
  });
});

describe('formValuesToPayload', () => {
  it('recombines name + description and trims address', () => {
    const payload = formValuesToPayload(baseForm);
    expect(payload.description).toBe('Villa\n\nBuild a villa');
    expect(payload.budget).toBe(250000);
    expect(payload.address).toBe('Riyadh');
  });

  it('omits budget when unspecified', () => {
    const payload = formValuesToPayload({ ...baseForm, budgetUnspecified: true, budget: '' });
    expect(payload.budget).toBeUndefined();
  });

  it('converts phase weeks → days and omits empty metrics', () => {
    const payload = formValuesToPayload({
      ...baseForm,
      phases: [
        { id: null, phaseNumber: '', description: 'Phase A', durationWeeks: '2', amount: '5000' },
        { id: 9, phaseNumber: '2', description: 'Phase B', durationWeeks: '', amount: '' },
      ],
    });
    expect(payload.phases[0]).toEqual({
      id: null,
      description: 'Phase A',
      phaseNumber: 1,
      timeSpentDays: 14,
      moneySpent: 5000,
    });
    expect(payload.phases[1]).toEqual({ id: 9, description: 'Phase B', phaseNumber: 2 });
  });

  it('round-trips existing photos only when present', () => {
    expect(formValuesToPayload(baseForm).existingPhotos).toBeUndefined();
    expect(
      formValuesToPayload({ ...baseForm, existingPhotos: ['keep.jpg'] }).existingPhotos,
    ).toEqual(['keep.jpg']);
  });
});

describe('buildOwnerEditFormData', () => {
  const jpeg = (name: string) => new File([new Uint8Array([1])], name, { type: 'image/jpeg' });

  it('appends scalars + new files as `images`, round-tripping existing photos', () => {
    const fd = buildOwnerEditFormData({ ...baseForm, existingPhotos: ['keep.jpg'] }, [
      jpeg('a.jpg'),
      jpeg('b.jpg'),
    ]);
    expect(fd.get('description')).toBe('Villa\n\nBuild a villa');
    expect(fd.get('budget')).toBe('250000');
    expect(fd.get('address')).toBe('Riyadh');
    expect(fd.getAll('existingPhotos')).toEqual(['keep.jpg']);
    expect(fd.getAll('images').map((f) => (f as File).name)).toEqual(['a.jpg', 'b.jpg']);
  });

  it('serializes phases as a JSON string and omits budget when unspecified', () => {
    const fd = buildOwnerEditFormData(
      {
        ...baseForm,
        budgetUnspecified: true,
        budget: '',
        phases: [{ id: null, phaseNumber: '1', description: 'P1', durationWeeks: '2', amount: '' }],
      },
      [],
    );
    expect(fd.has('budget')).toBe(false);
    expect(fd.getAll('images')).toEqual([]);
    expect(JSON.parse(String(fd.get('phases')))[0]).toMatchObject({
      description: 'P1',
      timeSpentDays: 14,
    });
  });
});
