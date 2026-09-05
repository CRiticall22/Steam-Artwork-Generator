import { describe, expect, it } from 'vitest';
import { computeTextScale, gradientAngleAtTime, hexToRgb, REFERENCE_HEIGHT } from './canvasRenderer';
import { createDefaultLayerStack } from '../data/presets';

// Note on scope: jsdom has no native Canvas2D rasterizer (HTMLCanvasElement
// .getContext('2d') is unimplemented without the optional native `canvas`
// package), so full pixel-output assertions on `renderFrame` aren't run
// here — that would mean depending on a native build toolchain just for
// tests. The dev-overlay described in the design spec is the intended way
// to catch DOM/Canvas2D visual drift while building a layer. What's
// tested here is every pure calculation `renderFrame` depends on.

describe('computeTextScale', () => {
  it('is 1 at the reference height with no override', () => {
    expect(computeTextScale(REFERENCE_HEIGHT)).toBe(1);
  });

  it('scales proportionally to height', () => {
    expect(computeTextScale(REFERENCE_HEIGHT * 2)).toBeCloseTo(2);
    expect(computeTextScale(REFERENCE_HEIGHT / 2)).toBeCloseTo(0.5);
  });

  it('applies a font-scale override multiplicatively', () => {
    expect(computeTextScale(REFERENCE_HEIGHT, 1.5)).toBeCloseTo(1.5);
    expect(computeTextScale(REFERENCE_HEIGHT * 2, 0.5)).toBeCloseTo(1);
  });
});

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0080')).toEqual({ r: 255, g: 0, b: 128 });
  });

  it('parses 3-digit shorthand hex', () => {
    expect(hexToRgb('#f08')).toEqual({ r: 255, g: 0, b: 136 });
  });
});

describe('gradientAngleAtTime', () => {
  const layer = createDefaultLayerStack().gradientOverlay;

  it('returns the static angle when not animated', () => {
    const stillLayer = { ...layer, animated: false, angle: 90 };
    expect(gradientAngleAtTime(stillLayer, 0)).toBe(90);
    expect(gradientAngleAtTime(stillLayer, 42)).toBe(90);
  });

  it('sweeps a full rotation over one animation cycle', () => {
    const spinningLayer = { ...layer, animated: true, angle: 0, animationSpeedSec: 4 };
    expect(gradientAngleAtTime(spinningLayer, 0)).toBeCloseTo(0);
    expect(gradientAngleAtTime(spinningLayer, 1)).toBeCloseTo(90);
    expect(gradientAngleAtTime(spinningLayer, 2)).toBeCloseTo(180);
    expect(gradientAngleAtTime(spinningLayer, 4)).toBeCloseTo(0);
  });

  it('wraps the base angle into the sweep', () => {
    const spinningLayer = { ...layer, animated: true, angle: 300, animationSpeedSec: 4 };
    expect(gradientAngleAtTime(spinningLayer, 2)).toBeCloseTo((300 + 180) % 360);
  });
});
