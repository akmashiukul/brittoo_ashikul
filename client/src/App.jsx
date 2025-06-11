import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";
import RegisterModal from "./components/auth/RegisterModal";
import LoginModal from "./components/auth/LoginModal";
import Test from "./pages/Test";
import VerifyOTP from "./pages/VerifyOTP";
import VerifyUser from "./pages/VerifyUser";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import DashboardLayout from "./pages/private/DashboardLayout";
import ListItems from "./pages/private/dash-pages/ListItems";
import Overview from "./pages/private/dash-pages/Overview";
import ManageItems from "./pages/private/dash-pages/ManageItems";
import UserAnalytics from "./pages/private/dash-pages/UserAnalytics";
import UpdateItem from "./pages/private/dash-pages/UpdateItem";
import ProductDetails from "./components/ProductDetails";
import RentalRequests from "./pages/private/dash-pages/RentalRequests";
import CreditModal from "./components/modals/CreditModal";
import BuyBccModal from "./components/modals/BuyBccModal";
import BuyRccModal from "./components/modals/BuyRccModal";
import BuyGccModal from "./components/modals/BuyGccModal";
import useBuyBccModalStore from "./stores/creditModalStores/useBuyBccModalStore";
import useBuyRccModalStore from "./stores/creditModalStores/useBuyRccModalStore";
import useBuyGccModalStore from "./stores/creditModalStores/useBuyGccModalStore";
import useUserStore from "./stores/authStores/useUserStore";
import BuyCredits from "./pages/BuyCredits";
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import CreditRequests from "./pages/admin/admin-dash-pages/CreditRequests";
import AdminOverview from "./pages/admin/admin-dash-pages/AdminOverview";

const AppContent = () => {
  const location = useLocation();
  const { loading } = useUserStore();
  const { isBuyBccModalOpen } = useBuyBccModalStore();
  const { isBuyRccModalOpen } = useBuyRccModalStore();
  const { isBuyGccModalOpen } = useBuyGccModalStore();

  const noNavbarRoutes = [
    "/dashboard",
    "/verify-otp",
    "/verify-user",
    "/dashboard/admin",
  ];

  const hideNavbar = noNavbarRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <>
      {!loading && !hideNavbar && <Navbar />}

      {/* Auth Modals */}
      <RegisterModal />
      <LoginModal />

      {/* Credit Modals */}
      <CreditModal />

      {isBuyBccModalOpen && <BuyBccModal />}
      {isBuyRccModalOpen && <BuyRccModal />}
      {isBuyGccModalOpen && <BuyGccModal />}

      <div className="overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-user" element={<VerifyUser />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/buy-credits" element={<BuyCredits />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route
              path="/dashboard/admin"
              element={<AdminDashboardLayout />}
            >
              <Route path="credit-requests" element={<CreditRequests />} />
              <Route path="admin-overview" element={<AdminOverview />} />
            </Route>
          </Route>

          {/* Private Routes (User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
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
