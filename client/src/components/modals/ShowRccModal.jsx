import { X } from "lucide-react";
import useShowRccModalStore from "../../stores/creditModalStores/useShowRccModalStore";
import brittooFav from '../../assets/brittoofav.png'
import { Link, useNavigate } from "react-router-dom";

const ShowRccModal = () => {
  const { closeShowRccModal, rcc } = useShowRccModalStore();
  const navigate = useNavigate();

  const goToRent = () => {
    closeShowRccModal();
    navigate('/browse');
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeShowRccModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-2xl md:text-3xl font-semibold text-purple-700 mt-1 md:mt-3">
                Congratulations!!
              </h3>
              <p className="text-gray-500 text-sm mt-3">
                You have recieved a{" "}
                <span className="text-red-500 font-semibold">
                  Red Cache Credit
                </span>{" "}
                Card
              </p>
            </div>

            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeShowRccModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="mt-6 flex flex-col items-center pb-10">
            <div className="text-white w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md bg-gradient-to-r from-red-600 to-red-200">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xs md:text-sm"> CC Amount </h2>
                  <p className="text-lg md:text-xl font-bold"> {rcc.amount} </p>
                </div>
                <img src={brittooFav} alt="fav" className="w-10 h-10" />
              </div>

              <div className="flex justify-between mt-5">
                <div>
                  <h3 className="text-xs"> Issued At </h3>
                  <p className="font-semibold text-sm"> {new Date(rcc.createdAt).toLocaleDateString()} </p>
                </div>
                <div className="text-gray-600">
                  <h3 className="text-xs"> Valid Till </h3>
                  <p className={"font-semibold text-sm"}>{
                      rcc.validityEnd ? new Date(rcc.validityEnd).toLocaleDateString() : `--/--`
                    }</p>
                </div>
              </div>
            </div>
              <p onClick={goToRent} className="mt-4 text-sm underline text-green-600 cursor-pointer hover:text-green-700 font-semibold">Use it for renting items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowRccModal;
