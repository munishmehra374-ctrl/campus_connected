import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MentorStatusBanner from "./components/MentorStatusBanner";

// Pages
import HomePage from "./pages/HomePage";
import ResourcesPage from "./pages/ResourcesPage";
import MentorshipPage from "./pages/MentorshipPage";
import CampusHubPage from "./pages/CampusHubPage";
import SocietiesPage from "./pages/SocietiesPage";
import SocietyDetail from "./pages/SocietiesPage/components/SocietyDetail/SocietyDetail";
import CreateSociety from "./pages/SocietiesPage/CreateSociety";

// Career Module
import CareerPage from "./pages/CareerPage/index";
import DomainDetails from "./pages/CareerPage/components/DomainDetails";

// Auth
import LoginPage from "./pages/AuthPage/LoginForm";
import RegisterPage from "./pages/AuthPage/RegisterForm";
import ProtectedRoute from "./pages/AuthPage/ProtectedRoute";
import MentorVerificationPage from "./pages/MentorVerificationPage";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <MentorStatusBanner />
      <Routes>
        <Route path="home" element={<HomePage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="mentorship" element={<MentorshipPage />} />
        {/* Campus Hub (navbar) + legacy /events links */}
        <Route path="campus-hub" element={<CampusHubPage />} />
        <Route path="events" element={<Navigate to="/campus-hub" replace />} />

        {/* Societies Module */}
        <Route path="societies" element={<SocietiesPage />} />
        <Route path="societies/:id" element={<SocietyDetail />} />
        <Route path="societies/create" element={
          <ProtectedRoute adminOnly><CreateSociety /></ProtectedRoute>
        } />

        {/* Career Module */}
        <Route path="career" element={<CareerPage />} />
        <Route path="career/:id" element={<DomainDetails />} />

        <Route
          path="mentor-verifications"
          element={
            <ProtectedRoute adminOnly>
              <MentorVerificationPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;