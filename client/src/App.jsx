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
import ListItems from "./pages/private/pages/ListItems";
import Overview from "./pages/private/pages/Overview";
import ManageItems from "./pages/private/pages/ManageItems";
import UserAnalytics from "./pages/private/pages/UserAnalytics";
import UpdateItem from "./pages/private/pages/UpdateItem";
import ProductDetails from "./components/ProductDetails";
import RentalRequests from "./pages/private/pages/RentalRequests";


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