import {imgUrlDictSet, imgUrlDictGet, View, ViewType} from './common';

describe('dict', () => {
  const val = {url: 'asdf'};
  const key = {type: ViewType.Satellite, zoom: 4};

  it('inserts values', () => {
    const before = {4: {[ViewType.Hybrid]: {}}};
    const after = imgUrlDictSet(before, key, val);
    expect(after).toEqual({
      4: {
        [ViewType.Hybrid]: {},
        [ViewType.Satellite]: val,
      }
    });
  });

  it('inserts values 2', () => {
    const before = {3: {[ViewType.Satellite]: {url: 'ee'}}};
    const after = imgUrlDictSet(before, key, val);
    expect(after).toEqual({
      3: before[3],
      4: {[ViewType.Satellite]: val},
    });
  });

  it('replaces values', () => {
    const before = {4: {[ViewType.Satellite]: {}}};
    const after = imgUrlDictSet(before, key, val);
    expect(after).toEqual({
      4: { [ViewType.Satellite]: val }
    });
  });

  it('gets the setted value', () => {
    expect(imgUrlDictGet(imgUrlDictSet({}, key, val), key)).toEqual(val);
  });
});
