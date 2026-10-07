import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateReadingSeconds, captionReadingWindows, budgetStaticRuns} from '../src/visual/pacing-budget.mjs';

test('reading estimates account for Chinese density and technical tokens; overrides remain explicit', () => {
  assert.ok(estimateReadingSeconds('事务提交成功后，再写入缓存并返回调用者。') > estimateReadingSeconds('完成。'));
  assert.equal(estimateReadingSeconds('Get'), estimateReadingSeconds('CachedArticleRepository.Sync'));
  const windows = captionReadingWindows({id:'demo',duration:6,cues:[[0,'完成。',{readingSeconds:4}]]});
  assert.equal(windows[0].minFrames,120);
  assert.throws(() => captionReadingWindows({id:'bad',duration:1,cues:[[0,'完成。']]}));
});
test('a static cap cannot steal caption reading time or shorten moving frames', () => {
  const runs = [{frame:0,originalStartFrame:0,originalEndFrame:1},{frame:1,originalStartFrame:1,originalEndFrame:2},{frame:2,originalStartFrame:2,originalEndFrame:150}];
  const result = budgetStaticRuns(runs,54,[{id:'caption',startFrame:0,endFrame:150,minFrames:120}]);
  assert.equal(result.runs[0].durationFrames,1);assert.equal(result.runs[1].durationFrames,1);
  assert.equal(result.budgets[0].outputFrames,120);
});
test('boundaries divide shared holds; overlapping budgets and frame mapping stay monotonic', () => {
  const result = budgetStaticRuns([{frame:0,originalStartFrame:0,originalEndFrame:300}],30,[{id:'a',startFrame:0,endFrame:150,minFrames:100},{id:'b',startFrame:150,endFrame:300,minFrames:110},{id:'both',startFrame:0,endFrame:300,minFrames:220}]);
  assert.deepEqual(result.runs.map(r=>[r.originalStartFrame,r.originalEndFrame]),[[0,150],[150,300]]);
  assert.ok(result.budgets.every(w=>w.outputFrames>=w.minFrames));
  assert.equal(result.runs.reduce((s,r)=>s+r.durationFrames,0),220);
  assert.throws(()=>budgetStaticRuns([{originalStartFrame:1,originalEndFrame:10}],30));
  assert.throws(()=>budgetStaticRuns([{originalStartFrame:0,originalEndFrame:10}],30,[{id:'bad',startFrame:0,endFrame:10,minFrames:11}]));
});
