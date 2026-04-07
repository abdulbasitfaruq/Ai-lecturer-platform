import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import {Routes, Route} from 'react-router-dom'
import LoginPage from './pages/LoginPage'

function App() {
    return (
        <div>
            <Navbar />

            <main className="min-h-screen">
                <Routes>
                    <Route path="/" element={<HomePage  />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}

export default App