import { X } from "lucide-react";
import useCreditModalStore from "../../stores/creditModalStores/useCreditModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../shared/Loader";
import BCC from "../CacheCreditCard/BCC";

const CreditModal = () => {
  const { closeCreditModal, isCreditModalOpen, requiredDeposit } =
    useCreditModalStore();
  const { currentUser } = useUserStore();
  const [bcc, setBcc] = useState(null);
  const [rcc, setRcc] = useState([]);
  const [loading, setLoading] = useState(false);

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
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-xs md:text-lg font-semibold text-gray-700">
                Deposit Cache Credit
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Required:</strong>{" "}
                <span className="italic text-gray-800">
                  {requiredDeposit} CC
                </span>
              </p>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeCreditModal}
            >
              {" "}
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="px-5 mt-2">
            <h3 className="mt-1 text-sm font-semibold">Available Blue Cache Credits:</h3>
            {/* blue */}
            <div className="mt-4 flex flex-col md:flex-row items-center">
              <BCC bcc={bcc} />
            </div>
            {/* reds */}
            <div>
              
            </div>
          </div>
          <div className="p-4 md:p-5">
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
