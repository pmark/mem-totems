import GameCanvas from './components/GameCanvas';
import DebugOverlay from './components/DebugOverlay';
import GameHUD from './components/GameHUD';
import TouchControls from './components/TouchControls';
import TouchButtons from './components/TouchButtons';
import OrientationHint from './components/OrientationHint';
import DeathModal from './components/DeathModal';

import './App.css'

function App() {
  return (
    <div className="app-root">
      <GameCanvas />
      <GameHUD />
  <TouchControls />
  <TouchButtons />
  <OrientationHint />
    <DeathModal />
      <DebugOverlay />
    </div>
  );
}

export default App
