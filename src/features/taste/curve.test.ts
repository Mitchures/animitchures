import { positionOf, scaleDivisor, usableBuckets, SITE_MEAN } from './curve';

const buckets = (...pairs: [number, number][]) => pairs.map(([score, count]) => ({ score, count }));

describe('scaleDivisor', () => {
  // Every case below is a real shape observed on live AniList accounts.
  it('treats buckets topping out at 100 as a 100-point scale', () => {
    expect(scaleDivisor(buckets([60, 333], [80, 176], [100, 12]))).toBe(1);
  });

  it('treats buckets topping out at 10 as a 10-point scale', () => {
    expect(scaleDivisor(buckets([6, 8], [8, 23], [10, 7]))).toBe(10);
  });

  it('treats buckets topping out at 5 as a 5-point scale', () => {
    expect(scaleDivisor(buckets([3, 5], [4, 31], [5, 10]))).toBe(20);
  });
});

describe('usableBuckets', () => {
  it('drops the zero bucket and sorts ascending', () => {
    expect(usableBuckets(buckets([80, 4], [0, 91], [60, 2]))).toEqual([
      { score: 60, count: 2 },
      { score: 80, count: 4 },
    ]);
  });
});

describe('positionOf', () => {
  const even = buckets([10, 1], [20, 2], [30, 3], [40, 4], [50, 5]);

  it('centres a mark on its bucket', () => {
    // Five buckets, so each occupies 20% and the third is centred at 50%.
    expect(positionOf(even, 30)).toBeCloseTo(50);
  });

  it('interpolates between two buckets', () => {
    expect(positionOf(even, 35)).toBeCloseTo(60);
  });

  it('clamps below the first and above the last bucket', () => {
    expect(positionOf(even, 5)).toBeCloseTo(10);
    expect(positionOf(even, 500)).toBeCloseTo(90);
  });

  it('handles the sparse, irregular buckets real accounts return', () => {
    // A live account reported exactly these four and nothing else.
    const sparse = buckets([70, 1], [90, 1], [95, 1], [100, 19]);
    // 80 sits midway between the 70 and 90 buckets: centres at 12.5% and
    // 37.5%, so the mark lands at 25%. A linear 0-100 axis would have put
    // it at 80%.
    expect(positionOf(sparse, 80)).toBeCloseTo(25);
  });

  it('places a 10-point account by its converted mean, not its raw one', () => {
    const tens = buckets([6, 8], [7, 15], [8, 23], [9, 15], [10, 7]);
    const divisor = scaleDivisor(tens);
    // meanScore arrives as 79.75 out of 100 even though the buckets are 6-10.
    const raw = 79.75;
    // Raw, it exceeds the top bucket and clamps to the far right.
    expect(positionOf(tens, raw)).toBeCloseTo(90);
    // Converted to 7.975 it lands just short of the 8 bucket's centre (50%).
    expect(positionOf(tens, raw / divisor)).toBeCloseTo(49.5);
  });

  it('brings the site mean onto the account scale too', () => {
    const tens = buckets([6, 8], [8, 23], [10, 7]);
    expect(SITE_MEAN / scaleDivisor(tens)).toBeCloseTo(6.9);
  });
});
