import { describe, test, expect } from 'vitest';
import { createRequire } from 'node:module';
const { parseTime, parseSpan, frames, cut, quietest } = createRequire(import.meta.url)('./cut_audio.cjs');

// A fake MP3: MPEG-1 Layer III, 128 kbps, 44.1 kHz, no padding → 417-byte frames of 1152 samples (~26 ms).
const frame = (fill = 0, xing = false) => {
  const f = Buffer.alloc(417, fill);
  f[0] = 0xff; f[1] = 0xfb; f[2] = 0x90; f[3] = 0x00;
  if (xing) f.write('Xing', 36, 'latin1');
  return f;
};
const mp3 = (n, xing = false) => Buffer.concat([...(xing ? [frame(0, true)] : []), ...Array.from({ length: n }, (_, i) => frame(i % 200 + 1))]);
const FRAME_S = 1152 / 44100;

describe('times', () => {
  test('m:ss, m:ss.s and plain seconds', () => {
    expect(parseTime('1:02.5')).toBe(62.5);
    expect(parseTime('13:59')).toBe(839);
    expect(parseTime('75')).toBe(75);
    expect(() => parseTime('1:xx')).toThrow();
  });
  test('ranges must end after they start', () => {
    expect(parseSpan('13:59-14:45')).toEqual([839, 885]);
    expect(() => parseSpan('2:00-1:00')).toThrow();
    expect(() => parseSpan('2:00')).toThrow();
  });
});

describe('frames and cutting', () => {
  test('finds every frame, after an ID3 tag, and drops the Xing header frame', () => {
    const id3 = Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0, 0, 0, 0, 10]), Buffer.alloc(10)]);
    const fr = frames(Buffer.concat([id3, mp3(100, true)]));
    expect(fr).toHaveLength(100);
    expect(fr[0].time).toBe(0);
    expect(fr[1].time).toBeCloseTo(FRAME_S, 6);
  });
  test('joins the ranges in order, whole frames only', () => {
    const buf = mp3(400), fr = frames(buf);
    const out = cut(buf, fr, [[0, 1], [5, 6]]);
    expect(out.length % 417).toBe(0);
    const n = out.length / 417;
    expect(n).toBeGreaterThan(70);
    expect(n).toBeLessThan(80);   // ~38 frames a second, twice
    expect(frames(out)).toHaveLength(n);
  });
  test('not an MP3 → a clear error', () => {
    expect(() => frames(Buffer.from('hello world'))).toThrow(/MP3/);
  });
});

describe('snapping to a pause', () => {
  test('moves a cut to the quietest 0.4 s nearby', () => {
    const rms = Array(300).fill(1);
    for (let k = 120; k < 126; k++) rms[k] = 0.01;   // a pause at 12.0–12.6 s
    const t = quietest(rms, 11, 2);
    expect(t).toBeGreaterThanOrEqual(12.1);
    expect(t).toBeLessThanOrEqual(12.5);
    expect(quietest(rms, 20, 2)).toBeGreaterThan(17.5);   // too far away to find it
  });
});
