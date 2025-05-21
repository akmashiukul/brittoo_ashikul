import { Link, NavLink } from "react-router-dom";
import brittoLogo from "../../assets/britto-logo.png";
import { IoLogOut } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
const user = false;
const profileImg =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const Navbar = () => {
  const menuClassname =
    "block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700";
  const [isUserDropDownOpen, setIsUserDropDownOpen] = useState(false);
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);

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
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-600"
                >
                  Home
                </NavLink>
                <NavLink
                  to="/browse"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-600"
                >
                  Browse Items
                </NavLink>
                <NavLink
                  to="/how-it-works"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-600"
                >
                  How Brittoo Works
                </NavLink>
                <NavLink
                  to="/faq"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-600"
                >
                  FAQ
                </NavLink>
                <NavLink
                  to="/contact"
                  className="text-gray-600 text-[16px] cursor-pointer hover:text-green-600"
                >
                  Contact
                </NavLink>
              </div>
            </nav>

            {user ? (
              <img
                src={profileImg}
                alt=""
                className="size-8 md:size-10 object-cover rounded-full mr-3 md:relative cursor-pointer"
                onClick={() => setIsUserDropDownOpen((prevState) => !prevState)}
              />
            ) : (
              <div className="flex gap-4">
                <button className="text-xs md:text-base mr-3 lg:mr-0 px-3 py-2 border border-gray-300 text-gray-700 hover:border-green-600 hover:bg-green-600 rounded-lg hover:text-white cursor-pointer bg-transparent">
                  Log In
                </button>
                <button className="px-3 py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 hidden md:block">
                  Sign Up
                </button>
              </div>
            )}
            {isUserDropDownOpen && (
              <div className="absolute end-0 z-10 mt-0.5 w-56 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg top-14 overflow-x-hidden">
                <div className="p-2">
                  <Link to="" className={menuClassname}>
                    My profile
                  </Link>
                  <Link to="" className={menuClassname}>
                    Billing summary
                  </Link>
                  <Link to="" className={menuClassname}>
                    Team settings
                  </Link>
                </div>
                {user && (
                  <button className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50 cursor-pointer mb-2 mx-2">
                    <IoLogOut size={20} />
                    Logout
                  </button>
                )}
              </div>
            )}
            {isHamMenuOpen && (
              <div className="absolute end-0 z-10 mt-0.5 w-56 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg top-14 overflow-x-hidden">
                <div className="p-2">
                  <NavLink
                    to="/"
                    className={menuClassname}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/browse"
                    className={menuClassname}
                  >
                    Browse Items
                  </NavLink>
                  <NavLink
                    to="/how-it-works"
                    className={menuClassname}
                  >
                    How Brittoo Works
                  </NavLink>
                  <NavLink
                    to="/faq"
                    className={menuClassname}
                  >
                    FAQ
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className={menuClassname}
                  >
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
