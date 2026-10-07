import {CompositionPatternsDemo} from './scenes/CompositionPatternsDemo';
import {ProgressiveCausalDemo} from './scenes/ProgressiveCausalDemo';
import {Composition,Folder} from 'remotion';
import {VisualLibraryDemo} from './scenes/VisualLibraryDemo';
import {FocusTrailDemo} from './scenes/FocusTrailDemo';
import {BackendResourcesDemo} from './scenes/BackendResourcesDemo';
import {BackendGlyphsDemo} from './scenes/BackendGlyphsDemo';
import {CausalTimelineDemo} from './scenes/CausalTimelineDemo';
import {ArchitectureMapDemo} from './scenes/ArchitectureMapDemo';

export const RemotionRoot = () => <>
  <Folder name="Architecture"><Composition id="ArchitectureMapDemo" component={ArchitectureMapDemo} durationInFrames={630} fps={30} width={1280} height={720}/></Folder>
  <Folder name="Timing"><Composition id="CausalTimelineDemo" component={CausalTimelineDemo} durationInFrames={360} fps={30} width={1280} height={720}/></Folder>
  <Folder name="Backend"><Composition id="BackendResourcesDemo" component={BackendResourcesDemo} durationInFrames={720} fps={30} width={1280} height={720}/><Composition id="BackendGlyphsDemo" component={BackendGlyphsDemo} durationInFrames={240} fps={30} width={1280} height={720}/></Folder>
  <Folder name="Patterns"><Composition id="FocusTrailDemo" component={FocusTrailDemo} durationInFrames={210} fps={30} width={1280} height={720}/><Composition id="VisualLibraryDemo" component={VisualLibraryDemo} durationInFrames={720} fps={30} width={1280} height={720}/><Composition id="CompositionPatternsDemo" component={CompositionPatternsDemo} durationInFrames={750} fps={30} width={1280} height={720}/><Composition id="ProgressiveCausalDemo" component={ProgressiveCausalDemo} durationInFrames={750} fps={30} width={1280} height={720}/></Folder>
</>;
