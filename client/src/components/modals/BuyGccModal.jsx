import { useState } from "react";
import useUserStore from "../../stores/authStores/useUserStore";
import useBuyGccModalStore from "../../stores/creditModalStores/useBuyGccModalStore";
import { MapPin, Truck, X } from "lucide-react";

const BuyGccModal = () => {
  const { currentUser } = useUserStore();
  const { closeBuyGccModal } = useBuyGccModalStore();

  const [loading, setLoading] = useState(false);
  const [depositMethod, setDepositMethod] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const depositMethodLabels = {
    DROP_AT_PUP: {
      title: "Drop at Pickup Point",
      icon: <MapPin className="w-6 h-6 text-green-500 mb-1" />,
      description: "Bring your item to a nearby pickup location.",
    },
    DEPOSIT_FROM_HOME: {
      title: "Home Pickup Service",
      icon: <Truck className="w-6 h-6 text-green-500 mb-1" />,
      description: "We’ll collect the item from your home.",
    },
  };

  return (
    <div
      id="buy-gray-cc-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 overflow-y-scroll"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBuyGccModal();
      }}
    >
      <div className="relative p-4 w-full md:max-w-xl sm:max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mt-1 md:mt-3">
                Get Your Gray Cache Credit
              </h3>
              <p className="text-gray-500 text-xs font-medium"></p>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="buy-gray-cc-modal"
              onClick={closeBuyGccModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <h4 className="mb-2 text-xs md:text-sm font-medium text-gray-900 pb-1 pt-2 border-b-2 mx-4 border-gray-300">
            Available GCC: {0}
          </h4>
          <div className="bg-white px-4 rounded-lg mt-4 mb-4">
            <h3 className="font-semibold text-Gray-800 mb-2">
              📋 Instructions :
            </h3>
            <p className="text-gray-500 text-xs">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolor reprehenderit numquam, eaque iure tempore exercitationem quam ad fugit consequuntur aspernatur. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta cupiditate, libero modi maxime eligendi non provident tenetur? Quae, optio exercitationem?</p>
          </div>
          <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h4 className="block mb-2 text-xs md:text-sm font-medium text-gray-900">
                Select Deposit Method
              </h4>
              <div className="flex items-center gap-4 mt-2">
                {["DROP_AT_PUP", "DEPOSIT_FROM_HOME"].map((method) => {
                  const { title, icon, description } =
                    depositMethodLabels[method];
                  return (
                    <label
                      key={method}
                      className="cursor-pointer w-40 h-28 relative"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        className="hidden peer"
                        onChange={() => setDepositMethod(method)}
                      />
                      <div
                        className="bg-white rounded-xl border shadow-md transition duration-300 w-full h-full flex flex-col justify-center items-center text-center p-3
          hover:scale-105 hover:bg-green-50
          peer-checked:border-green-500 peer-checked:bg-green-200"
                      >
                        <div>{icon}</div>
                        <div className="font-semibold text-sm">{title}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          {description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {depositMethod === "DEPOSIT_FROM_HOME" ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      placeholder="Enter you city here"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                    >
                      Complete Address
                    </label>
                    <textarea
                      type="text"
                      name="address"
                      id="address"
                      placeholder="Enter you complete address."
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 h-24 focus:border-blue-500 block w-full p-2 md:p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="productName"
                      className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                    >
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="productName"
                      id="productName"
                      placeholder="Enter you phone number."
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                      required
                    />
                  </div>
                </div>
              ) : depositMethod === 'DROP_AT_PUP' && (
                <div>
                  <label
                    htmlFor="productType"
                    className="flex flex-col gap-1.5 w-full"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Select Nearest Dropping Point
                    </span>
                    <select
                      name="productType"
                      id="productType"
                      required
                      className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                      onChange={(e) => {}}
                    >
                      <option value="">Please select</option>
                      <option value="CSE_1">CSE Building-1</option>
                      <option value="ADMIN_1">Admin Building-1</option>
                      <option value="BANGABANDHU_HALL_1">
                        Bangabandhu Hall-1
                      </option>
                      <option value="ZIA_HALL_1">Zia Hall-1</option>
                      <option value="LIBRARY_1">Library-1</option>
                    </select>
                  </label>
                </div>
              )}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder="Enter you phone number."
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Deposit Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Estimated Deposit Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyGccModal;
