/** Pure, frame-quantized causal scheduler. Authoring units: seconds. */
export function compileTimeline(specs, fps = 30) {
  if (!Number.isInteger(fps) || fps <= 0) throw new Error('fps must be a positive integer');
  const byId = new Map();
  for (const spec of specs) {
    if (!spec.id || byId.has(spec.id)) throw new Error(`Missing or duplicate event: ${spec.id}`);
    if (!['task','transfer','state','join','presentation'].includes(spec.kind)) throw new Error(`Unknown kind: ${spec.id}`);
    if (!Number.isFinite(spec.duration) || spec.duration < 0 || (spec.kind === 'transfer' && spec.duration <= 0)) throw new Error(`Invalid duration: ${spec.id}`);
    if (spec.at !== undefined && (!Number.isFinite(spec.at) || spec.at < 0)) throw new Error(`Invalid anchor: ${spec.id}`);
    if (!spec.after?.length && !spec.with && spec.at === undefined) throw new Error(`Unanchored event: ${spec.id}`);
    byId.set(spec.id, spec);
  }
  const compiled = new Map(), visiting = new Set();
  const resolve = (id) => {
    if (compiled.has(id)) return compiled.get(id);
    const spec = byId.get(id);
    if (!spec) throw new Error(`Missing dependency: ${id}`);
    if (visiting.has(id)) throw new Error(`Dependency cycle: ${id}`);
    visiting.add(id);
    const after = (spec.after ?? []).map(resolve);
    const simultaneous = spec.with ? resolve(spec.with) : null;
    const startFrame = Math.max(Math.round((spec.at ?? 0)*fps), simultaneous?.startFrame ?? 0, ...after.map(e=>e.endFrame));
    if (simultaneous && startFrame !== simultaneous.startFrame) throw new Error(`Fork cannot start together: ${id}`);
    const durationFrames = Math.round(spec.duration*fps);
    if (spec.kind === 'transfer' && durationFrames < 1) throw new Error(`Transfer shorter than one frame: ${id}`);
    const event = Object.freeze({...spec, after: Object.freeze([...(spec.after??[])]), startFrame, endFrame:startFrame+durationFrames});
    visiting.delete(id); compiled.set(id,event); return event;
  };
  specs.forEach(e=>resolve(e.id));
  const events = Object.freeze(specs.map(e=>compiled.get(e.id)));
  const get = id => {const e=compiled.get(id);if(!e)throw new Error(`Unknown event: ${id}`);return e;};
  const frameAt = time => Math.floor(time*fps+1e-6);
  const phase = (id,time) => {const e=get(id),f=frameAt(time);return f<e.startFrame?'pending':f<e.endFrame?'running':'done';};
  const timeline = {
    fps, events, get, frameAt,
    start:id=>get(id).startFrame/fps, end:id=>get(id).endFrame/fps,
    phase, started:(id,time)=>phase(id,time)!=='pending', done:(id,time)=>phase(id,time)==='done',
    progress:(id,time)=>{const e=get(id),f=frameAt(time);return e.endFrame===e.startFrame?(f>=e.endFrame?1:0):Math.max(0,Math.min(1,(f-e.startFrame)/(e.endFrame-e.startFrame)));},
    actorPhase:(actor,time)=>{const own=events.filter(e=>e.actor===actor&&e.kind==='task');if(!own.length)throw new Error(`Unknown actor: ${actor}`);return own.some(e=>phase(e.id,time)==='running')?'running':own.some(e=>phase(e.id,time)==='done')?'done':'pending';},
  };
  return Object.freeze(timeline);
}

/** Captions refer to the same event clock. Numeric anchors remain only for legacy callers. */
export function resolveCues(cues, timeline) {
  return cues.map(c=>[c[2]?(c[2].edge==='end'?timeline.end(c[2].event):timeline.start(c[2].event)):Number(c[0]),c[1],c[2]]);
}

/** Full movement intervals + exact state/task/caption boundaries; no scene-clock clamping. */
export function timelineWindows(timeline, duration, cueTimes = []) {
  const count=Math.round(duration*timeline.fps),windows=[];
  for(const e of timeline.events){
    const moves=e.motion??(e.kind==='transfer'||e.kind==='presentation');
    if(moves&&e.endFrame>e.startFrame)windows.push([e.startFrame,e.endFrame]);
    for(const boundary of [e.startFrame,e.endFrame])windows.push([boundary,boundary+1]);
  }
  for(const time of cueTimes){const f=Math.round(time*timeline.fps);windows.push([f,f+Math.round(.6*timeline.fps)]);}
  const merged=[];
  for(const [a,b] of windows.sort((a,b)=>a[0]-b[0])){
    const start=Math.max(0,a),end=Math.min(count,b);if(end<=start)continue;
    if(merged.length&&start<=merged.at(-1)[1])merged.at(-1)[1]=Math.max(merged.at(-1)[1],end);
    else merged.push([start,end]);
  }
  return merged.map(([a,b])=>[a/timeline.fps,b/timeline.fps]);
}

export function resolveChapter(chapter, fps=30){
  const timeline=compileTimeline(chapter.events,fps),cues=resolveCues(chapter.cues,timeline);
  const count=Math.round(chapter.duration*fps);
  for(const e of timeline.events)if(e.endFrame>=count)throw new Error(`Event outside chapter ${chapter.id}: ${e.id}`);
  let previous=-1;
  for(const c of cues){if(c[0]<=previous||c[0]>=chapter.duration||c[0]<0)throw new Error(`Caption order in ${chapter.id}: ${c[0]}`);previous=c[0];}
  if(cues[0]?.[0]!==0)throw new Error(`First caption must start at zero: ${chapter.id}`);
  const navigationTimes=(chapter.navigation??[]).map(id=>timeline.start(id));
  return {...chapter,cues,timeline,motionWindows:timelineWindows(timeline,chapter.duration,[...cues.map(c=>c[0]),...navigationTimes])};
}
