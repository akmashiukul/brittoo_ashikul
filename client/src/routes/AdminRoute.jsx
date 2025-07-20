import Loader from "../components/shared/Loader";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import useUserStore from "../stores/authStores/useUserStore";
import { useEffect, useState, useRef } from "react";
import api from "../lib/api";

const AdminRoute = () => {
  const { currentUser, loading } = useUserStore();
  const [userDetails, setUserDetails] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const fetchUserDetails = async () => {
      try {
        setIsVerifying(true);
        setError(null);
        abortControllerRef.current = new AbortController();
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const res = await api.get("/api/v1/auth/get-current-user", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: abortControllerRef.current.signal
        });
        if (!res.data.success) {
          setError("Failed to verify admin status");
          navigate("/");
          return;
        }
        setUserDetails(res.data.data);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error("Admin verification error:", error);
        setError("Authentication failed");
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setIsVerifying(false);
      }
    };
    fetchUserDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentUser, navigate]);

  if (loading || isVerifying) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return <Navigate to="/" replace />;
  }

  if (userDetails?.role === "ADMIN") {
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
};

export default AdminRoute;