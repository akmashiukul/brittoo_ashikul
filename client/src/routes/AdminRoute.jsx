import Loader from "../components/shared/Loader";

import { Navigate, Outlet, useNavigate } from "react-router-dom";
import useUserStore from "../stores/authStores/useUserStore";
import { useEffect, useState } from "react";
import api from "../lib/api";

const AdminRoute = () => {
  const { currentUser, loading } = useUserStore();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = async () => {
      try {
        setAdminLoading(true);
        const res = await api.get("/api/v1/auth/get-current-user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!res.data.success) {
          alert("Something went wrong");
          navigate("/");
        }
        setLoggedInUser(res.data.data);
      } catch (error) {
        console.log(error);
        setAdminLoading(false);
      } finally {
        setAdminLoading(false);
      }
    }
    if (currentUser) {
      loggedInUser();
    }
  }, [currentUser, navigate]);

  if (loading || adminLoading) {
    return <Loader />;
  }
  if (loggedInUser && loggedInUser.role === "ADMIN") {
    return <Outlet />;
  }

  return <Navigate to={"/"} replace />;
};

export default AdminRoute;
