/** A reading estimate is a review aid; technical symbols count as tokens, not raw letters. */
export function estimateReadingSeconds(text, {cjkPerSecond = 7.5, tokenSeconds = .38, orientationSeconds = .8, minimumSeconds = 2.8} = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Caption text must be non-empty.');
  for (const value of [cjkPerSecond, tokenSeconds, orientationSeconds, minimumSeconds]) {
    if (!Number.isFinite(value) || value <= 0) throw new Error('Reading settings must be positive.');
  }
  const cjk = [...text.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)].length;
  const tokens = [...text.matchAll(/[A-Za-z_][A-Za-z_0-9]*(?:[.:][A-Za-z_][A-Za-z_0-9]*)*|\d+(?:\.\d+)?/g)].length;
  return Math.max(minimumSeconds, orientationSeconds + cjk / cjkPerSecond + tokens * tokenSeconds);
}

/** Pass resolved event-bound cues. An override is measured in seconds of actual screen time. */
export function captionReadingWindows(chapter, fps = 30) {
  if (!Number.isInteger(fps) || fps <= 0) throw new Error('fps must be a positive integer.');
  return chapter.cues.map((cue, index) => {
    const seconds = cue[2]?.readingSeconds ?? estimateReadingSeconds(cue[1]);
    if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('readingSeconds must be positive.');
    const startFrame = Math.round(cue[0] * fps);
    const endFrame = Math.round((chapter.cues[index + 1]?.[0] ?? chapter.duration) * fps);
    const minFrames = Math.ceil(seconds * fps - 1e-7);
    if (endFrame - startFrame < minFrames) throw new Error(`Caption ${chapter.id}:${index + 1} needs ${minFrames / fps}s; revise the authored schedule or text.`);
    return {id: `${chapter.id}:caption-${index + 1}`, startFrame, endFrame, minFrames};
  });
}

/** Shorten only already-proven identical runs; restore holds until every reading window fits. */
export function budgetStaticRuns(runs, maxHoldFrames = null, windows = []) {
  if (maxHoldFrames !== null && (!Number.isInteger(maxHoldFrames) || maxHoldFrames < 1)) throw new Error('Invalid hold limit.');
  let cursor = 0;
  for (const run of runs) {
    if (run.originalStartFrame !== cursor || !Number.isInteger(run.originalEndFrame) || run.originalEndFrame <= cursor) throw new Error('Runs must cover contiguous source frames.');
    cursor = run.originalEndFrame;
  }
  for (const window of windows) {
    if (![window.startFrame, window.endFrame, window.minFrames].every(Number.isInteger) || window.startFrame < 0 || window.endFrame > cursor || window.endFrame <= window.startFrame || window.minFrames < 1 || window.minFrames > window.endFrame - window.startFrame) throw new Error(`Invalid reading window: ${window.id}`);
  }
  const boundaries = [...new Set(windows.flatMap(w => [w.startFrame, w.endFrame]))].sort((a, b) => a - b);
  const result = runs.flatMap(run => {
    const cuts = [run.originalStartFrame, ...boundaries.filter(f => f > run.originalStartFrame && f < run.originalEndFrame), run.originalEndFrame];
    return cuts.slice(0, -1).map((start, i) => ({...run, originalStartFrame: start, originalEndFrame: cuts[i + 1], durationFrames: Math.min(cuts[i + 1] - start, maxHoldFrames ?? Infinity)}));
  });
  for (const window of windows) {
    const inside = result.filter(run => run.originalStartFrame >= window.startFrame && run.originalEndFrame <= window.endFrame);
    let needed = window.minFrames - inside.reduce((sum, run) => sum + run.durationFrames, 0);
    // Keep the action intact and spend extra observation time on its final state first.
    for (const run of [...inside].reverse()) {
      if (needed <= 0) break;
      const restored = Math.min(needed, run.originalEndFrame - run.originalStartFrame - run.durationFrames);
      run.durationFrames += restored;
      needed -= restored;
    }
    if (needed > 0) throw new Error(`Cannot preserve reading window: ${window.id}`);
  }
  return {runs: result, budgets: windows.map(window => ({...window, outputFrames: result.filter(run => run.originalStartFrame >= window.startFrame && run.originalEndFrame <= window.endFrame).reduce((sum, run) => sum + run.durationFrames, 0)}))};
}
