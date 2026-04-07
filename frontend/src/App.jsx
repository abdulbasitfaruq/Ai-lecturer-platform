import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import {Routes, Route, BrowserRouter} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashbordPage'

function App() {
    return (
        <BrowserRouter>
                <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage  />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                    </Routes>
                <Footer />
        </BrowserRouter>
    )
}

export default App