import useRegModalStore from "../../stores/useRegModalStore";
import brittoLogo from "../../assets/britto-logo.png";
import useLoginModalStore from "../../stores/useLoginModalStore";
import { Link } from "react-router-dom";

const RegisterModal = () => {
  const { isRegModalOpen, closeRegModal } = useRegModalStore();
  const { openLoginModal } = useLoginModalStore();

  if (!isRegModalOpen) return null;

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRegModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <div className="flex flex-col items-center text-center w-full">
              <img
                src={brittoLogo}
                className="h-8 md:h-12 object-contain"
                alt="Britto"
              />
              <h3 className="text-xs md:text-lg font-semibold text-gray-700 mt-1 md:mt-4">
                Create Your Brittoo Account
              </h3>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeRegModal}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5">
            <form className="space-y-4" action="#">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 md:p-2.5"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Your password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 md:p-2.5"
                  required
                />
              </div>
              <div className="flex justify-between mt-8">
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      type="checkbox"
                      value=""
                      className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-green-300"
                      required
                    />
                  </div>
                  <label
                    htmlFor="remember"
                    className="ms-2 text-xs font-medium text-gray-900"
                  >
                    I have read and agree to the <Link to='/terms&conditions' className="text-green-600 underline dark:text-green-500">terms and conditions.</Link>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center"
              >
                Create Account
              </button>
              <div className="text-xs md:text-sm font-medium text-gray-500">
                Have an account?{" "}
                <a onClick={() => {
                  closeRegModal();
                  openLoginModal();
                }} className="text-green-700 hover:underline cursor-pointer">
                  Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
