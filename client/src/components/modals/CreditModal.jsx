import { X } from "lucide-react";
import useCreditModalStore from "../../stores/creditModalStores/useCreditModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../shared/Loader";
import BCC from "../CacheCreditCard/BCC";
import RCC from "../CacheCreditCard/RCC";
import CCDisplay from "../CacheCreditCard/CCDisplay";

const CreditModal = () => {
  const { closeCreditModal, isCreditModalOpen, requiredDeposit } =
    useCreditModalStore();
  const { currentUser } = useUserStore();
  const [bcc, setBcc] = useState(null);
  const [rcc, setRcc] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBcc, setSelectedBcc] = useState(0);
  const [selectedRCCs, setSelectedRCCs] = useState([]);

  useEffect(() => {
    const getAvailableBcc = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/api/v1/credit/bcc/available/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.data.success) {
          return;
        }
        setBcc(res.data.data);
      } catch (error) {
        console.log(error);
        alert("error in getting users bcc");
      } finally {
        setLoading(false);
      }
    };

    const getAvailableRcc = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/api/v1/credit/rcc/available/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.data.success) {
          return;
        }
        setRcc(res.data.data);
      } catch (error) {
        console.log(error);
        alert("error in getting users rcc");
      } finally {
        setLoading(false);
      }
    };

    if (isCreditModalOpen) {
      getAvailableBcc();
      getAvailableRcc();
    }
  }, [currentUser.id, isCreditModalOpen]);


  const totalSelectedRcc = selectedRCCs.reduce(
    (sum, selectedRcc) => sum + selectedRcc.selectedAmount,
    0,
  );
  const selected = selectedBcc + totalSelectedRcc;
  const remaining = requiredDeposit - selected;

  const handleBccSelect = () => {
    if (remaining > 0 && bcc >= remaining) {
      setSelectedBcc(remaining);
    } else if (remaining > 0 && selectedBcc === 0) {
      setSelectedBcc(bcc);
    } else {
      setSelectedBcc(0)
    }
  }
  const handleRccSelect = (rccParams) => {
    const alreadySelected = selectedRCCs.find((selectedRcc) => selectedRcc.rcc.id === rccParams.id)
    if (alreadySelected) {
      setSelectedRCCs(selectedRCCs.filter((selectedRcc) => selectedRcc.rcc.id !== rccParams.id));
    }
    else if(remaining > 0 && rccParams.amount >= remaining) {
      setSelectedRCCs([...selectedRCCs, {rcc: rccParams, selectedAmount: remaining}]);
    } else if (remaining > 0) {
      setSelectedRCCs([...selectedRCCs, {rcc: rccParams, selectedAmount: rccParams.amount}]);;
    }
  }

  if (loading) {
    return <Loader />;
  }

  if (!isCreditModalOpen) return null;

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCreditModal();
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
              <CCDisplay required={requiredDeposit} selectedBcc={selectedBcc} selectedRCCs={selectedRCCs} remaining={remaining} selected={selected} />
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeCreditModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-3 md:px-5 mt-2">
              <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                🔵Available Blue Cache Credits
              </h3>
              <div className="mt-4 flex flex-col sm:flex-row items-center">
                <BCC handleSelect={handleBccSelect} bcc={bcc} selectedBcc={selectedBcc} />
              </div>
              <h3 className="mt-6 text-sm font-semibold text-center sm:text-left">
                🔴Available Red Cache Credits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2 justify-self-center sm:justify-self-start">
                {rcc?.map((credit) => (
                  <RCC handleSelect={handleRccSelect} key={credit.id} rcc={credit} selectedRCCs={selectedRCCs} />
                ))}
              </div>
            </div>
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
  );
};

export default CreditModal;
