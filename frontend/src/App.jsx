import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { VerticalNavbar, MobileBottomNav } from './components/VerticalNavbar';
import Home from './components/Home';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister';
import FindGym from './components/FindGym';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import GymOwnerRegistration from './pages/GymOwnerRegistration';
import GymOwnerLogin from './pages/GymOwnerLogin';
import GymOwnerDashboard from './pages/GymOwnerDashboard';
import AddGymForm from './pages/AddGymForm';
import Trainers from './pages/Trainers/Trainers';
import TrainerProfile from './pages/Trainers/TrainerProfile';
import TrainerRegister from './pages/Trainer/TrainerRegister';
import TrainerLogin from './pages/Trainer/TrainerLogin';
import TrainerDashboard from './pages/Trainer/TrainerDashboard';
import FindGymsPage from './pages/FindGymsPage';
import RegisterGymPage from './pages/RegisterGymPage';
import GymDetails from './pages/GymDetails';
import GymSetup from './pages/GymSetup';
import Categories from './pages/Categories';
import MyOrders from './pages/MyOrders';
import HealthStoreRegister from './pages/HealthStoreRegister';

// Conditional Navbar wrapper
const Navigation = () => {
  const location = useLocation();
  const hideNav = [
    '/gyms',
    '/trainer/dashboard',
    '/trainer/register',
    '/trainer/login',
  ];
  if (
    hideNav.includes(location.pathname) ||
    location.pathname.startsWith('/gym-owner') ||
    location.pathname.startsWith('/gym-setup') ||
    location.pathname.startsWith('/health-store/register')
  ) return null;
  return <Navbar />;
};

const FooterWrapper = () => {
  const location = useLocation();
  const hideFooter = [
    '/gyms',
    '/trainer/dashboard',
    '/trainer/register',
    '/trainer/login',
  ];
  if (
    hideFooter.includes(location.pathname) ||
    location.pathname.startsWith('/gym-owner') ||
    location.pathname.startsWith('/health-store/register')
  ) return null;
  return <Footer />;
};

const LenisScroll = () => {
  const location = useLocation();

  useEffect(() => {
    const skipPaths = ['/gyms', '/trainer/dashboard', '/trainer/register', '/trainer/login'];
    if (skipPaths.includes(location.pathname) || location.pathname.startsWith('/gym-owner')) {
      return;
    }


    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [location.pathname]);

  return null;
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);

  useEffect(() => {
    const handleCollapse = (e) => {
      setSidebarCollapsed(e.detail);
    };
    window.addEventListener("sidebar-collapse-change", handleCollapse);

    return () => {
      window.removeEventListener("sidebar-collapse-change", handleCollapse);
    };
  }, []);

  // Request location permission immediately when the website loads
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('user_latitude', position.coords.latitude.toString());
          localStorage.setItem('user_longitude', position.coords.longitude.toString());
          window.dispatchEvent(new Event('location-updated'));
        },
        (error) => {
          console.warn("Location request declined or timed out on app startup:", error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    }
  }, []);

  return (
    <Router>
      <LenisScroll />
      <div className="flex flex-col min-h-screen bg-black">
        <Toaster position="top-right" />
        <VerticalNavbar />
        <MobileBottomNav />
        <Navigation />
        <div className={`flex-grow pb-[70px] lg:pb-0 transition-all duration-300 ${sidebarCollapsed ? "lg:pr-0" : "lg:pr-[100px]"}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/register-gym" element={<RegisterGymPage />} />
            <Route path="/gyms" element={<FindGymsPage />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/gym-owner/register" element={<GymOwnerRegistration />} />
            <Route path="/gym-owner/login" element={<GymOwnerLogin />} />
            <Route path="/gym-owner/dashboard" element={<GymOwnerDashboard />} />
            <Route path="/gym-owner/add-gym" element={<AddGymForm />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/trainer/register" element={<TrainerRegister />} />
            <Route path="/trainer/login" element={<TrainerLogin />} />
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/:trainerId" element={<TrainerProfile />} />

            <Route path="/gym-details" element={<GymDetails />} />
            <Route path="/gym-setup/:gymId" element={<GymSetup />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/health-store/register/:token" element={<HealthStoreRegister />} />
           </Routes>
        </div>
        <div className={`pb-[70px] lg:pb-0 transition-all duration-300 ${sidebarCollapsed ? "lg:pr-0" : "lg:pr-[100px]"}`}>
          <FooterWrapper />
        </div>
      </div>
    </Router>
  );
}

export default App;
