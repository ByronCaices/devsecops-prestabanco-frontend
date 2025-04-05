import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Navbar from "./components/Navbar"
import Home from './components/Home';
import NotFound from './components/NotFound';
import MCSimulation from './components/MCSimulation';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister'
import { AuthProvider } from './context/AuthContext';
import MCApplication from './components/MCApplication';
import MCTracking from './components/MCTracking';
import MCEvaluationList from './components/MCEvaluationList';
import MCEvaluation from './components/MCEvaluation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/simulation" element={<MCSimulation />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path='/register' element={<UserRegister />} />
            <Route path='/mcapplication' element={<MCApplication/>} />
            <Route path='/tracking' element={<MCTracking/>} />
            <Route path='/evaluation' element={<MCEvaluationList/>} />
            <Route path="*" element={<NotFound />} />
            <Route path="/evaluation/:id" element={<MCEvaluation/>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;