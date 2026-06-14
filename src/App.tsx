import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainMenu } from './pages/MainMenu';
import { FleetFormation } from './pages/FleetFormation';
import { StarMap } from './pages/StarMap';
import { Missions } from './pages/Missions';
import { CrewTraining } from './pages/CrewTraining';
import { Warehouse } from './pages/Warehouse';
import { Battle } from './pages/Battle';
import { BattleResult } from './pages/BattleResult';
import { ToastContainer } from './components/ui/ToastContainer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-space-950">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/fleet" element={<FleetFormation />} />
          <Route path="/starmap" element={<StarMap />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/crew" element={<CrewTraining />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/battle/:stageId" element={<Battle />} />
          <Route path="/result/:battleId" element={<BattleResult />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}
