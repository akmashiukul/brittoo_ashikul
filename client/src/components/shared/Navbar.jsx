import { Link, NavLink, useNavigate } from "react-router-dom";
import brittoLogo from "../../assets/brittoo-logo.png";
import { IoLogOut } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { useEffect, useState } from "react";
import Avatar from "boring-avatars";
import Swal from "sweetalert2";
import useRegModalStore from "../../stores/authStores/useRegModalStore";
import useLoginModalStore from "../../stores/authStores/useLoginModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import api from "../../lib/api";
import { Coins, CreditCard } from "lucide-react";

const Navbar = () => {
  const menuClassname =
    "block rounded-lg px-4 py-2 text-xs md:text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700";
  const [isUserDropDownOpen, setIsUserDropDownOpen] = useState(false);
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);
  const { openRegModal } = useRegModalStore();
  const { openLoginModal } = useLoginModalStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [totalCredits, setTotalCredits] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTotalCredits = async () => {
      try {
        const res = await api.get("/api/v1/users/total-credits", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.data.success) {
          setTotalCredits({
            totalAvailableBcc: 0,
            totalAvailableRcc: 0,
          });
          return;
        }
        setTotalCredits(res.data.data);
      } catch (error) {
        console.log("Error in fetching user total credits: ", error);
      }
    };
    if (currentUser) {
      fetchUserTotalCredits();
    }
  }, [currentUser]);

  const handleLogOut = () => {
    Swal.fire({
      title: "Logging Out?",
      text: "Your first year study group lasted longer than this session",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes! Take me outta this shit",
      cancelButtonText: "Let me rot a little longer",
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("login-dt");
        sessionStorage.removeItem("hasFetchedUser");
        setIsUserDropDownOpen(false);
        Swal.fire({
          title: "Session Terminated",
          text: "Unlike your CG, this completed successfully.",
          icon: "success",
        });
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        setIsUserDropDownOpen(false);
      }
    });
  };

  return (
    <header className="bg-white shadow-md z-10 relative">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link to={"/"}>
              <img
                src={brittoLogo}
                className="h-8 md:h-10 object-contain"
                alt="Britto"
              />
            </Link>
          </div>

          <div className="md:flex md:items-center md:gap-6">
            <nav className="hidden md:block">
              <div className="flex items-center gap-6 text-sm">
                <NavLink
                  to="/"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  Home
                </NavLink>
                <NavLink
                  to="/browse"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  Browse Items
                </NavLink>
                <NavLink
                  to="/buy-credits"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  Buy Credits
                </NavLink>
                <NavLink
                  to="/dashboard/overview"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  Dashboard
                </NavLink>
              </div>
            </nav>

            {currentUser ? (
              <div className="flex items-center gap-3 sm:gap-6 mr-2.5 sm:mr-0">
                <div className="flex items-center gap-2 md:gap-4 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
                  {/* BCC */}
                  <div className="flex items-center gap-1">
                    <div className="sm:w-6 sm:h-6 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coins className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                      {totalCredits?.totalAvailableBcc || 0}
                    </span>
                    <span className="text-xs font-medium text-blue-600 sm:hidden">
                      {totalCredits?.totalAvailableBcc || 0}
                    </span>
                  </div>

                  {/* RCC */}
                  <div className="flex items-center gap-1">
                    <div className="sm:w-6 sm:h-6 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-red-600 hidden sm:inline">
                      {totalCredits?.totalAvailableRcc || 0}
                    </span>
                    <span className="text-xs font-medium text-red-600 sm:hidden">
                      {totalCredits?.totalAvailableRcc || 0}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Avatar
                    name={currentUser.email}
                    colors={[
                      "#482344",
                      "#2b5166",
                      "#429867",
                      "#fab243",
                      "#e02130",
                    ]}
                    variant="beam"
                    size={35}
                    className="cursor-pointer"
                    onClick={() =>
                      setIsUserDropDownOpen((prevState) => !prevState)
                    }
                  />
                  {isUserDropDownOpen && (
                    <div
                      className="absolute end-0 z-20 mt-0.5 w-48 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg overflow-x-hidden top-10 lg:-left-3"
                    >
                      <div className="p-2">
                        <Link to="/dashboard/overview" className={menuClassname}>
                          My Dashboard
                        </Link>
                        {currentUser.role === "ADMIN" && (
                          <Link
                            to="/dashboard/admin/manage-users"
                            className={menuClassname}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      {currentUser && (
                        <button
                          className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50 cursor-pointer mb-2 mx-2"
                          onClick={handleLogOut}
                        >
                          <IoLogOut size={20} />
                          Logout
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={openLoginModal}
                  className="text-xs md:text-base mr-3 lg:mr-0 px-3 py-2 border border-gray-300 text-gray-700 hover:border-green-600 hover:bg-green-600 rounded-lg hover:text-white cursor-pointer bg-transparent"
                >
                  Log In
                </button>
                <button
                  onClick={openRegModal}
                  className="px-3 py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 hidden md:block"
                >
                  Sign Up
                </button>
              </div>
            )}
            {isHamMenuOpen && (
              <div className="absolute end-0 z-10 mt-0.5 w-40 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg top-12 overflow-x-hidden right-2">
                <div className="p-2">
                  <NavLink to="/" className={menuClassname}>
                    Home
                  </NavLink>
                  <NavLink to="/browse" className={menuClassname}>
                    Browse Items
                  </NavLink>
                  <NavLink to="/buy-credits" className={menuClassname}>
                    Buy Credits
                  </NavLink>
                  <NavLink
                    to="/dashboard/overview"
                    className={menuClassname}
                  >
                    Dashboard
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          <GiHamburgerMenu
            onClick={() => setIsHamMenuOpen((prevState) => !prevState)}
            className="block md:hidden"
            size={24}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
