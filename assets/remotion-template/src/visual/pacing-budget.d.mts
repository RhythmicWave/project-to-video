export type ReadingSettings={cjkPerSecond?:number;tokenSeconds?:number;orientationSeconds?:number;minimumSeconds?:number};
export type ReadingWindow={id:string;startFrame:number;endFrame:number;minFrames:number};
export type StaticRun={originalStartFrame:number;originalEndFrame:number};
export function estimateReadingSeconds(text:string,settings?:ReadingSettings):number;
export function captionReadingWindows(chapter:{id:string;duration:number;cues:[number,string,{readingSeconds?:number;[key:string]:unknown}?][]},fps?:number):ReadingWindow[];
export function budgetStaticRuns<T extends StaticRun>(runs:T[],maxHoldFrames?:number|null,windows?:ReadingWindow[]):{runs:(T&{durationFrames:number})[];budgets:(ReadingWindow&{outputFrames:number})[]};
