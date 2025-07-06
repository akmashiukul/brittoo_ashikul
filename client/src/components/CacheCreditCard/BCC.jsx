import bccLogo from "../../assets/logos/bcc-logo.png";

const BCC = ({ bccWallet, handleSelect, selectedBcc, inRRModal }) => {
  return (
    <div
      onClick={handleSelect}
      className={`text-black w-[185px]  p-3 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md ${
        selectedBcc > 0 && !inRRModal
          ? "bg-blue-100 border-[3px] border-blue-700"
          : "bg-gradient-to-r from-blue-400 to-blue-100"
      }`}
    >
      <div>
        <div className="flex justify-between">
          <div>
            <h2 className="text-xs"> Available CC </h2>
            <p className="font-bold italic">
              {" "}
              {bccWallet?.totalBalance - bccWallet?.lockedBalance}{" "}
              {selectedBcc > 0 && (
                <span className="text-red-600"> -{selectedBcc}</span>
              )}{" "}
            </p>
          </div>
          <img src={bccLogo} alt="fav" className="h-8 w-8" />
        </div>

        <div className="flex justify-between mt-2">
          <div>
            <h2 className="text-xs"> In Use </h2>
            <p className="font-bold italic text-gray-500">
              {" "}
              {bccWallet?.lockedBalance}{" "}
              {selectedBcc > 0 && (
                <span className="text-green-700"> + {selectedBcc}</span>
              )}{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BCC;
