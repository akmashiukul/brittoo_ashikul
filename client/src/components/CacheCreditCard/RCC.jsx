import brittoofav from "../../assets/brittoofav.png";

const RCC = ({ rcc, handleSelect, selectedRCCs }) => {
  const selectedRcc = selectedRCCs?.find((r) => r.rcc.id === rcc.id);
  return (
    <div onClick={() => handleSelect(rcc)} className={`text-black w-[190px]  p-4 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md ${selectedRcc ? "bg-red-100 border-[2px] border-red-700" : "bg-gradient-to-r from-red-400 to-red-100"}`}>
      <div className="flex justify-between">
        <div>
          <h2 className="text-xs"> CC Amount </h2>
          <p className="text-base font-bold italic"> {rcc.amount} {selectedRcc && <span className='text-red-600'> -{selectedRcc.selectedAmount}</span>} </p>
        </div>
        <img src={brittoofav} alt="fav" className="w-10 h-10" />
      </div>

      <div className="mt-2">
        {rcc.validityStart ? (
          <div className="flex justify-between">
            <div>
              <h3 className="text-xs"> Issued At </h3>
              <p className="font-semibold text-sm">{rcc.validityStart}</p>
            </div>
            <div className="text-gray-600">
              <h3 className="text-xs"> Valid Till </h3>
              <p className={"font-semibold text-sm"}>14/6/25</p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xs"> Status </h3>
            <p className="font-medium uppercase italic text-sm text-gray-600">
              inactive
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCC;
