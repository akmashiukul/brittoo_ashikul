import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
import CreditModal from "./components/modals/CreditModal";
import BuyBccModal from "./components/modals/BuyBccModal";
import useBuyBccModalStore from "./stores/creditModalStores/useBuyBccModalStore";
import useUserStore from "./stores/authStores/useUserStore";
import BuyCredits from "./pages/BuyCredits";
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import AdminOverview from "./pages/admin/admin-dash-pages/AdminOverview";
import ManageUsers from "./pages/admin/admin-dash-pages/ManageUsers";
import AllProducts from "./pages/AllProducts";
import BlueCCRequests from "./pages/admin/admin-dash-pages/BlueCCRequests";
import useShowRccModalStore from "./stores/creditModalStores/useShowRccModalStore";
import ShowRccModal from "./components/modals/ShowRccModal";
import ConfirmRentalRequestModal from "./components/modals/ConfirmRentalRequestModal";
import Swal from "sweetalert2";
import PlacedRequests from "./pages/private/dash-pages/PlacedRequests";
import RecievedRequests from "./pages/private/dash-pages/RecievedRequests";
import MyCredits from "./pages/private/dash-pages/MyCredits";
import AdminDashUserDetails from "./pages/admin/admin-dash-pages/AdminDashUserDetails";
import WithdrawalRequests from "./pages/admin/admin-dash-pages/WithdrawalRequests";
import RequestWithdrawalModal from "./components/modals/RequestWithdrawalModal";
import ManageRentalRequestsAdmin from "./pages/admin/admin-dash-pages/ManageRentalRequestsAdmin";
import { useState } from "react";
import Footer from "./components/shared/Footer";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, setCurrentUser, setLoading } = useUserStore();
  const { isBuyBccModalOpen } = useBuyBccModalStore();
  const { isShowRccModalOpen } = useShowRccModalStore();
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState("");

  // Terminate session if JWT expires
  const loginDtStr = localStorage.getItem("login-dt");
  const token = localStorage.getItem("token");
  if (token && loginDtStr) {
    const loginDT = new Date(loginDtStr);
    const now = new Date();
    const diff = now - loginDT;
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    if (diffInDays >= 2) {
      setCurrentUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("login-dt");
      Swal.fire({
        title: "Session Terminated",
        text: "This session is expired. Login again to start renting",
        icon: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 500);
    }
  }

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
      <ConfirmRentalRequestModal />
      <RequestWithdrawalModal />

      {isBuyBccModalOpen && <BuyBccModal />}
      {isShowRccModalOpen && <ShowRccModal />}

      <div className="overflow-x-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <Home setProductType={setProductType} setSearch={setSearch} />
            }
          />
          <Route path="/test" element={<Test />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-user" element={<VerifyUser />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/buy-credits" element={<BuyCredits />} />
          <Route
            path="/browse"
            element={
              <AllProducts
                productType={productType}
                setProductType={setProductType}
                search={search}
                setSearch={setSearch}
              />
            }
          />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/admin" element={<AdminDashboardLayout />}>
              <Route path="blue-cc-requests" element={<BlueCCRequests />} />
              <Route path="admin-overview" element={<AdminOverview />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route
                path="user-details/:userId"
                element={<AdminDashUserDetails />}
              />
              <Route
                path="withdrawal-requests"
                element={<WithdrawalRequests />}
              />
              <Route
                path="manage-rental-requests"
                element={<ManageRentalRequestsAdmin />}
              />
            </Route>
          </Route>

          {/* Private Routes (User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="overview" element={<Overview />} />
              <Route path="list-items" element={<ListItems />} />
              <Route path="manage-items" element={<ManageItems />} />
              <Route path="placed-requests" element={<PlacedRequests />} />
              <Route path="my-credits" element={<MyCredits />} />
              <Route path="recieved-requests" element={<RecievedRequests />} />
              <Route path="user-analytics" element={<UserAnalytics />} />
              <Route path="update-item/:id" element={<UpdateItem />} />
            </Route>
          </Route>
        </Routes>
      </div>
      {!loading && !hideNavbar && <Footer />}
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
