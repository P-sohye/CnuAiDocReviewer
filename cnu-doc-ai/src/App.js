import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/StudentPage/LoginPage';
import StudentLayout from "./layouts/StudentLayout";
import StudentMain from "./pages/StudentPage/StudentMain";

function App() {
    return (
        <BrowserRouter>
            <Header />
            <div style={{ paddingTop: '50px' }}>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route element={<StudentLayout />}>
                        <Route path="/student/main" element={<StudentMain />} />
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
