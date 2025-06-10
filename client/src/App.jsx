import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";
import RegisterModal from "./components/auth/RegisterModal";
import LoginModal from "./components/auth/LoginModal";
import Test from "./pages/Test";
import VerifyOTP from "./pages/VerifyOTP";
import useUserStore from "./stores/useUserStore";
import VerifyUser from "./pages/VerifyUser";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/private/DashboardLayout";
import ListItems from "./pages/private/dash-pages/ListItems";
import Overview from "./pages/private/dash-pages/Overview";
import ManageItems from "./pages/private/dash-pages/ManageItems";
import UserAnalytics from "./pages/private/dash-pages/UserAnalytics";
import UpdateItem from "./pages/private/dash-pages/UpdateItem";
import ProductDetails from "./components/ProductDetails";
import RentalRequests from "./pages/private/dash-pages/RentalRequests";
import CreditModal from "./components/CreditModal";
import BuyCredits from "./pages/private/BuyCredits";


const AppContent = () => {
  const location = useLocation();
  const { loading } = useUserStore();

  const noNavbarRoutes = ["/dashboard", "/verify-otp", "/verify-user", "/dashboard/admin"];

  const hideNavbar = noNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );


  return (
    <>
      {!loading && !hideNavbar && <Navbar />}
      <RegisterModal />
      <LoginModal />
      <CreditModal />
      <div className="overflow-x-hidden">
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-user" element={<VerifyUser />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/admin" element={<div>Admin Panel</div>} />
          </Route>

          {/* Private Routes (User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="overview" element={<Overview />} />
              <Route path="list-items" element={<ListItems />} />
              <Route path="manage-items" element={<ManageItems />} />
              <Route path="rental-requests" element={<RentalRequests />} />
              <Route path="user-analytics" element={<UserAnalytics />} />
              <Route path="update-item/:id" element={<UpdateItem />} />
            </Route>
            <Route path="/buy-credits" element={<BuyCredits />} />
          </Route>

        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;