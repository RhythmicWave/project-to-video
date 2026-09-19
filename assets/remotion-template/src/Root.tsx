import {CompositionPatternsDemo} from './scenes/CompositionPatternsDemo';
import {ProgressiveCausalDemo} from './scenes/ProgressiveCausalDemo';
import {Composition,Folder} from 'remotion';
import {VisualLibraryDemo} from './scenes/VisualLibraryDemo';
import {FocusTrailDemo} from './scenes/FocusTrailDemo';

export const RemotionRoot = () => <>
  <Folder name="Patterns"><Composition id="FocusTrailDemo" component={FocusTrailDemo} durationInFrames={210} fps={30} width={1280} height={720}/><Composition id="VisualLibraryDemo" component={VisualLibraryDemo} durationInFrames={720} fps={30} width={1280} height={720}/><Composition id="CompositionPatternsDemo" component={CompositionPatternsDemo} durationInFrames={750} fps={30} width={1280} height={720}/><Composition id="ProgressiveCausalDemo" component={ProgressiveCausalDemo} durationInFrames={750} fps={30} width={1280} height={720}/></Folder>
</>;
