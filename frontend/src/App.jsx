import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import {Routes, Route, BrowserRouter} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import GeneratePage from './pages/GeneratePage'
import LecturePage from './pages/LecturePage'
import GuestPage from './pages/GuestPage'
import LiveLecturePage from './pages/LiveLecturePage'

function App() {
    return (
        <BrowserRouter>
                <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage  />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/generate" element={<GeneratePage />} />
                        <Route path="/lecture/:id" element={<LecturePage />} />
                        <Route path="/guest" element={<GuestPage />} />
                       <Route path="/live" element={<LiveLecturePage />} />
                    </Routes>
                <Footer />
        </BrowserRouter>
    )
}

export default App