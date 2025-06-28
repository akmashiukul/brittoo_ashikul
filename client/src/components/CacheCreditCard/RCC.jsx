const RCC = ({rcc}) => {
  return (
    <div className="text-white w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md bg-gradient-to-r from-blue-600 to-blue-200">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xs md:text-sm"> CC Amount </h2>
          <p className="text-lg md:text-xl font-bold"> 5000 </p>
        </div>
        <img src="brittoofav.png" alt="fav" className="w-10 h-10" />
      </div>

      <div className="flex justify-between mt-5">
        <div>
          <h3 className="text-xs"> Issued At </h3>
          <p className="font-semibold text-sm"> 10/06/25 </p>
        </div>
        <div className="text-gray-600">
          <h3 className="text-xs"> Valid Till </h3>
          <p className={"font-semibold text-sm"}>14/6/25</p>
        </div>
      </div>
    </div>
  );
};

export default RCC;
