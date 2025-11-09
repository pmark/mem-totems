import GameCanvas from './components/GameCanvas';
import DebugOverlay from './components/DebugOverlay';

import './App.css'

function App() {
  return (
    <div className="w-screen h-screen bg-black text-white">
      <GameCanvas />
      <DebugOverlay />
    </div>
  );
}

export default App
