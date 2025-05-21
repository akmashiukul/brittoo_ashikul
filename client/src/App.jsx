import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";
import RegisterModal from "./components/auth/RegisterModal";
import LoginModal from "./components/auth/LoginModal";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <RegisterModal />
      <LoginModal />
      <div className="overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
