import { ArrowRight, CreditCard, X } from "lucide-react";
import useRequestWithdrawalModalStore from "../../stores/creditModalStores/useRequestWithdrawalModalStore";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import BCC from "../CacheCreditCard/BCC";
import { useState } from "react";

const RequestWithdrawalModal = () => {
  const {
    isRequestWithdrawalModalOpen,
    closeRequestWithdrawalModal,
    bccWallet,
  } = useRequestWithdrawalModalStore();
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    
  }

  if (!isRequestWithdrawalModalOpen) {
    return null;
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRequestWithdrawalModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t border-b border-gray-300 mx-4">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-2xl md:text-3xl font-semibold text-black mt-1 md:mt-3">
                Withdraw Money
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <CreditCard color="blue" size={30} />
                <ArrowRight size={30} color="gray" />
                <FaRegMoneyBillAlt color="green" size={30} />
              </div>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeRequestWithdrawalModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="mx-4 pb-6">
            <div className="mt-2">
              <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                🔵Available Blue Cache Credits
              </h3>
              <div className="mt-4 flex flex-col sm:flex-row items-center">
                <BCC
                  handleSelect={() => {}}
                  bccWallet={bccWallet}
                  selectedBcc={0}
                />
              </div>
            </div>
            <form onSubmit={handleWithdrawalSubmit} className="mt-6">
              <label
                htmlFor="withdrawalAmount"
                className="flex flex-col gap-1.5 w-full"
              >
                <span className="text-sm font-medium text-gray-700">
                  Enter Withdrawal Amount
                </span>
                <input
                  type="number"
                  required
                  id="withdrawalAmount"
                  className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                  placeholder="Enter amount of money you wanna withdraw"
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </label>
              <button type="submit" className="w-full bg-green-600 text-white mt-4 py-1 md:py-2 text-xs md:text-sm rounded-lg hover:bg-green-700 hover:shadow-md cursor-pointer">
                Request Withdrawal
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestWithdrawalModal;
