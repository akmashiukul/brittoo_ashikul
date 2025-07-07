import rccLogo from "../../assets/logos/rcc-logo.png";

const RCC = ({ rcc, handleSelect, selectedRCCs, inRRModal = false }) => {
  const selectedRcc = selectedRCCs?.find((r) => r.rcc.id === rcc.id);
  return (
    <div
      onClick={() => handleSelect(rcc)}
      className={`text-black w-[185px]  p-3 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md ${
        selectedRcc && !inRRModal
          ? "bg-red-100 border-[2px] border-red-700"
          : "bg-gradient-to-r from-red-400 to-red-100"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <h2 className="text-xs"> CC Amount </h2>
          <p className="text-base font-bold italic">
            {" "}
            {rcc.amount - rcc.inUse}{" "}
            {selectedRcc && (
              <span className="text-red-600">
                {" "}
                -{selectedRcc.selectedAmount}
              </span>
            )}{" "}
          </p>
        </div>
        <img src={rccLogo} alt="fav" className="w-8 h-8" />
      </div>

      <div className="mt-2">
        <h3 className="text-xs"> In Use </h3>
        <p className="font-medium uppercase italic text-sm text-gray-600">
          {rcc.inUse}
          {selectedRcc && (
            <span className="text-green-600"> +{selectedRcc.selectedAmount}</span>
          )}{" "}
        </p>
      </div>
    </div>
  );
};

export default RCC;
