import GameCanvas from './components/GameCanvas';
import DebugOverlay from './components/DebugOverlay';
import GameHUD from './components/GameHUD';
import TouchControls from './components/TouchControls';
import InteractButton from './components/InteractButton';
import OrientationHint from './components/OrientationHint';

import './App.css'

function App() {
  return (
    <div className="app-root">
      <GameCanvas />
      <GameHUD />
      <TouchControls />
      <InteractButton />
  <OrientationHint />
      <DebugOverlay />
    </div>
  );
}

export default App
