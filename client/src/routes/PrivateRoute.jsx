import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/shared/Loader";
import useUserStore from "../stores/useUserStore";

const PrivateRoute = () => {

  const { currentUser, loading } = useUserStore();

  if (loading) {
    return <Loader />
  }

  if (currentUser) {
    return <Outlet />
  };

  return <Navigate to={'/login'} replace />
}

export default PrivateRoute