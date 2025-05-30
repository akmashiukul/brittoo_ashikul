import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";
import RegisterModal from "./components/auth/RegisterModal";
import LoginModal from "./components/auth/LoginModal";
import Test from "./pages/Test";
import VerifyOTP from "./pages/VerifyOTP";
import useUserStore from "./stores/useUserStore";
import VerifyUser from "./pages/VerifyUser";

const App = () => {
  const { loading } = useUserStore();
  return (
    <BrowserRouter>
      {
        !loading && <Navbar />
      }
      <RegisterModal />
      <LoginModal />
      <div className="overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-user" element={<VerifyUser />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
