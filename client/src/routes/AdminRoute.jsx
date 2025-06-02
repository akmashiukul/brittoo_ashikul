import Loader from "../components/shared/Loader";
import useUserStore from "../stores/useUserStore";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { currentUser, loading } = useUserStore();

  if (loading) {
    return <Loader />;
  }
  if (currentUser && currentUser.role === "ADMIN") {
    return <Outlet />;
  }

  return <Navigate to={"/"} replace />;
};

export default AdminRoute;
