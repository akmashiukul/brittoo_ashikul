import { Link, NavLink } from "react-router-dom";
import brittoLogo from "../../assets/britto-logo.png";
import { IoLogOut } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
import useRegModalStore from "../../stores/useRegModalStore";
import useLoginModalStore from "../../stores/useLoginModalStore";
import useUserStore from "../../stores/useUserStore";
import Avatar from "boring-avatars";
import Swal from "sweetalert2";

const Navbar = () => {
  const menuClassname =
    "block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700";
  const [isUserDropDownOpen, setIsUserDropDownOpen] = useState(false);
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);
  const { openRegModal } = useRegModalStore();
  const { openLoginModal } = useLoginModalStore();
  const { currentUser, setCurrentUser } = useUserStore();

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
      setIsUserDropDownOpen(false);
      Swal.fire({
        title: "Session Terminated",
        text: "Unlike your CG, this completed successfully.",
        icon: "success",
      });
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

          <div className="md:flex md:items-center md:gap-12">
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
                  to="/how-it-works"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  How Brittoo Works
                </NavLink>
                <NavLink
                  to="/faq"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  FAQ
                </NavLink>
                <NavLink
                  to="/contact"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                >
                  Contact
                </NavLink>
              </div>
            </nav>

            {currentUser ? (
              <Avatar
                name={currentUser.email}
                colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                variant="beam"
                size={35}
                className="cursor-pointer mr-2 md:mr-0"
                onClick={() => setIsUserDropDownOpen((prevState) => !prevState)}
              />
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
            {isUserDropDownOpen && (
              <div
                className="absolute end-0 z-10 mt-0.5 w-48 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg top-14 right-1.5
               overflow-x-hidden"
              >
                <div className="p-2">
                  <Link to="/dashboard/overview" className={menuClassname}>
                    My Dashboard
                  </Link>
                  <Link to="" className={menuClassname}>
                    Billing summary
                  </Link>
                  <Link to="" className={menuClassname}>
                    Team settings
                  </Link>
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
            {isHamMenuOpen && (
              <div className="absolute end-0 z-10 mt-0.5 w-56 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg top-14 overflow-x-hidden">
                <div className="p-2">
                  <NavLink to="/" className={menuClassname}>
                    Home
                  </NavLink>
                  <NavLink to="/browse" className={menuClassname}>
                    Browse Items
                  </NavLink>
                  <NavLink to="/how-it-works" className={menuClassname}>
                    How Brittoo Works
                  </NavLink>
                  <NavLink to="/faq" className={menuClassname}>
                    FAQ
                  </NavLink>
                  <NavLink to="/contact" className={menuClassname}>
                    Contact
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
