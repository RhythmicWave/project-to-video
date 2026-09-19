/**
 * 教学动画的节奏档位。时间单位为秒；它们只控制动作时长，不会自动
 * 压缩章节或阅读停顿。场景可以按内容密度选择档位，也可以显式传入
 * 组件的 duration 覆盖默认值。
 */
export type PacingPreset = {
  reveal: number;
  fade: number;
  focus: number;
  transform: number;
  hold: number;
};

export const pacingPresets = {
  'fast-review': {
    reveal: 0.42,
    fade: 0.4,
    focus: 1.35,
    transform: 1.45,
    hold: 0.55,
  },
  balanced: {
    reveal: 0.55,
    fade: 0.5,
    focus: 1.7,
    transform: 1.7,
    hold: 0.7,
  },
  spacious: {
    reveal: 0.72,
    fade: 0.65,
    focus: 2.1,
    transform: 2.1,
    hold: 0.9,
  },
} as const satisfies Record<string, PacingPreset>;

export type PacingMode = keyof typeof pacingPresets;

/** 模板组件默认使用中等节奏；项目可在入口处选择其它档位。 */
export const pacing: PacingPreset = pacingPresets.balanced;

export const getPacing = (mode: PacingMode = 'balanced'): PacingPreset => pacingPresets[mode];
