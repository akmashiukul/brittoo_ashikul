import { Link, NavLink, useNavigate } from "react-router-dom";
import brittoLogo from "../../assets/brittoo-logo.png";
import { IoLogOut } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { useEffect, useState, useRef } from "react";
import Avatar from "boring-avatars";
import Swal from "sweetalert2";
import useRegModalStore from "../../stores/authStores/useRegModalStore";
import useLoginModalStore from "../../stores/authStores/useLoginModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import api from "../../lib/api";
import { Bell, Coins, CreditCard, ExternalLink, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const menuClassname =
    "block rounded-lg px-4 py-2 text-xs md:text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors";
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isUserDropDownOpen, setIsUserDropDownOpen] = useState(false);
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);
  const { openRegModal } = useRegModalStore();
  const { openLoginModal } = useLoginModalStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [totalCredits, setTotalCredits] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Scroll listener for floating glassmorphism effect & scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 25);

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((currentScrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropDownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/v1/notifications");
      setNotifications(res.data.data || []);
      setUnreadCount((res.data.data || []).filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleClick = async () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    if (!showNotificationDropdown && unreadCount > 0) {
      for (const n of notifications.filter((n) => !n.isRead)) {
        try {
          await api.put(`/api/v1/notifications/${n.id}/read`);
        } catch (e) {
          console.error(e);
        }
      }
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationDropdown(false);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

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
      text: "Are you sure you want to end your current session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Stay Logged In",
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("login-dt");
        sessionStorage.removeItem("hasFetchedUser");
        setIsUserDropDownOpen(false);
        Swal.fire({
          title: "Session Terminated",
          text: "You have been safely logged out.",
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

  const navLinkClasses = ({ isActive }) =>
    `relative px-3.5 py-1.5 rounded-full text-[15px] font-medium transition-all duration-200 ${
      isActive
        ? "text-emerald-700 bg-emerald-50/90 font-semibold shadow-xs"
        : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50/80"
    }`;

  return (
    <>
      <div
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "pt-3 px-3 sm:px-6 pointer-events-none"
            : "pt-0 px-0 pointer-events-auto"
        }`}
      >
        <header
          className={`mx-auto max-w-screen-xl transition-all duration-300 pointer-events-auto relative overflow-hidden ${
            isScrolled
              ? "bg-white/85 backdrop-blur-xl border border-white/60 shadow-xl shadow-black/[0.04] rounded-2xl md:rounded-full px-4 sm:px-6 py-1 ring-1 ring-black/[0.03]"
              : "bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-1.5 shadow-xs"
          }`}
        >
          {/* Scroll Progress Indicator */}
          {isScrolled && (
            <div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          )}

          <div className="flex h-12 md:h-14 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to={"/"} className="flex items-center group transition-transform duration-200 hover:scale-[1.03]">
                <img
                  id="navbar-brand-logo"
                  src={brittoLogo}
                  className="h-8 md:h-9 object-contain"
                  alt="Britto"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:block">
              <div className="flex items-center gap-2 text-sm bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                <NavLink to="/" className={navLinkClasses}>
                  Home
                </NavLink>
                <NavLink to="/browse" className={navLinkClasses}>
                  Browse Items
                </NavLink>
                <NavLink to="/buy-credits" className={navLinkClasses}>
                  Buy Credits
                </NavLink>
                <NavLink to="/dashboard/overview" className={navLinkClasses}>
                  Dashboard
                </NavLink>
              </div>
            </nav>

            {/* Right Action Icons & User Status */}
            <div className="flex items-center gap-3 md:gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Credit Cards (BCC & RCC) */}
                  <div className="flex items-center gap-2 bg-gray-50/90 backdrop-blur-sm rounded-full p-1 sm:px-2.5 sm:py-1 border border-gray-200/70 shadow-xs">
                    {/* BCC */}
                    <Link
                      to="/buy-credits"
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50/90 hover:bg-blue-100 text-blue-700 font-medium text-xs sm:text-sm transition-all hover:scale-105"
                      title="Blue Cash Credits (BCC)"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                        <Coins className="w-2.5 h-2.5" />
                      </div>
                      <span>{totalCredits?.totalAvailableBcc || 0}</span>
                      <span className="text-[10px] text-blue-500 font-bold hidden lg:inline">BCC</span>
                    </Link>

                    {/* RCC */}
                    <Link
                      to="/dashboard/my-credits"
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50/90 hover:bg-rose-100 text-rose-700 font-medium text-xs sm:text-sm transition-all hover:scale-105"
                      title="Red Cash Credits (RCC - Withdrawable)"
                    >
                      <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                        <CreditCard className="w-2.5 h-2.5" />
                      </div>
                      <span>{totalCredits?.totalAvailableRcc || 0}</span>
                      <span className="text-[10px] text-rose-500 font-bold hidden lg:inline">RCC</span>
                    </Link>
                  </div>

                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleClick}
                      className="relative p-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-full transition-colors"
                      title="Notifications"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotificationDropdown && (
                      <div className="fixed md:absolute right-2 left-2 md:right-0 md:left-auto mt-2 md:w-96 bg-white border border-gray-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 flex items-center justify-between">
                          <h3 className="text-white font-semibold text-sm md:text-base flex items-center gap-2">
                            <Bell size={16} /> Notifications
                          </h3>
                          {notifications.length > 0 && (
                            <span className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                              {notifications.length}
                            </span>
                          )}
                        </div>

                        <div className="max-h-[70vh] md:max-h-96 overflow-y-auto divide-y divide-gray-100">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell size={36} className="mx-auto text-gray-300 mb-2" />
                              <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((n) => {
                              const content = (
                                <div
                                  className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${
                                    !n.isRead ? "bg-emerald-50/40" : ""
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                        !n.isRead ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-gray-300"
                                      }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
                                          {n.title}
                                        </h4>
                                        {n.data?.url && (
                                          <ExternalLink size={13} className="text-gray-400 flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed">
                                        {n.body || n.message}
                                      </p>
                                      <p className="text-[11px] text-gray-400 mt-1.5">
                                        {getTimeAgo(n.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );

                              if (n.data?.url) {
                                return n.data.url.startsWith("/") ? (
                                  <Link
                                    key={n.id}
                                    to={n.data.url}
                                    onClick={() => setShowNotificationDropdown(false)}
                                  >
                                    {content}
                                  </Link>
                                ) : (
                                  <a
                                    key={n.id}
                                    href={n.data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setShowNotificationDropdown(false)}
                                  >
                                    {content}
                                  </a>
                                );
                              }
                              return (
                                <div key={n.id} onClick={() => handleNotificationClick(n)}>
                                  {content}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Avatar & Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setIsUserDropDownOpen((prev) => !prev)}
                      className="rounded-full ring-2 ring-emerald-500/20 hover:ring-emerald-500/60 transition p-0.5"
                    >
                      <Avatar
                        name={currentUser.email}
                        colors={["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]}
                        variant="beam"
                        size={32}
                      />
                    </button>

                    {isUserDropDownOpen && (
                      <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-md shadow-2xl p-1.5 divide-y divide-gray-100">
                        <div className="px-3 py-2">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {currentUser.name || "User"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard/overview"
                            className={menuClassname}
                            onClick={() => setIsUserDropDownOpen(false)}
                          >
                            My Dashboard
                          </Link>
                          {currentUser.role === "ADMIN" && (
                            <Link
                              to="/dashboard/admin/manage-users"
                              className={menuClassname}
                              onClick={() => setIsUserDropDownOpen(false)}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                        </div>

                        <div className="pt-1">
                          <button
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            onClick={handleLogOut}
                          >
                            <IoLogOut size={16} />
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openLoginModal}
                    className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-100/70 rounded-full transition-all"
                  >
                    Log In
                  </button>
                  <button
                    onClick={openRegModal}
                    className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-full shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setIsHamMenuOpen((prev) => !prev)}
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg md:hidden"
                aria-label="Toggle mobile menu"
              >
                <GiHamburgerMenu size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {isHamMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mx-auto max-w-screen-xl mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-2xl p-3 space-y-1 pointer-events-auto"
            >
              <NavLink
                onClick={() => setIsHamMenuOpen(false)}
                to="/"
                className={menuClassname}
              >
                Home
              </NavLink>
              <NavLink
                onClick={() => setIsHamMenuOpen(false)}
                to="/browse"
                className={menuClassname}
              >
                Browse Items
              </NavLink>
              <NavLink
                onClick={() => setIsHamMenuOpen(false)}
                to="/buy-credits"
                className={menuClassname}
              >
                Buy Credits
              </NavLink>
              <NavLink
                onClick={() => setIsHamMenuOpen(false)}
                to="/dashboard/overview"
                className={menuClassname}
              >
                Dashboard
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notification Full Modal Details */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Bell size={18} /> Notification
              </h3>
              <button
                onClick={closeModal}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {selectedNotification.title}
              </h4>
              <p className="text-xs text-gray-400 mb-4">
                {getTimeAgo(selectedNotification.createdAt)}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedNotification.body || selectedNotification.message}
              </p>
            </div>

            <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium text-xs transition"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;