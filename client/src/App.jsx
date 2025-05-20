import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="mx-auto lg:max-w-7xl overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
