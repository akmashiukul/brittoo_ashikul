import { X } from "lucide-react";
import useConfirmRentalRequestModalStore from "../../stores/creditModalStores/useConfirmRentalRequestModalStore";


const ConfirmRentalRequestModal = () => {

  const { closeConfirmRentalRequestModal, isConfirmRentalRequestModalOpen, data } = useConfirmRentalRequestModalStore();

  if (!isConfirmRentalRequestModalOpen) {
    return null;
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeConfirmRentalRequestModal();
        }
      }}
    >
      <div className="relative p-4 w-full max-w-[760px] max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm flex flex-col max-h-[95vh]">
          <div className="flex items-center justify-between mx-4 md:mx-5 border-b rounded-t border-gray-200 flex-shrink-0 pb-4">
            <div
              id="credit-calc"
              className="flex flex-col items-center text-center w-full"
            >
              <h3 className="text-lg font-semibold text-gray-700 mt-2">
                Deposit Cache Credit
              </h3>
              <p className="text-xs text-gray-600">
                No worries nigga! you'll get this back after you return the
                product
              </p>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeConfirmRentalRequestModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5 border-t border-gray-200 flex-shrink-0">
            <button
              type="submit"
              className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRentalRequestModal