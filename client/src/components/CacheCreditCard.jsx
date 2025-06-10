
const CacheCreditCard = ({ creditType, isValid }) => {

  const handleCacheCreditClick = async () => {
    //TODO:::+++++
  }

  let bgColor = 'bg-gradient-to-r from-gray-600 to-gray-200';
  if (creditType == 'BLUE_CC') {
    bgColor = 'bg-gradient-to-r from-blue-600 to-blue-200';
  } else if (creditType == 'RED_CC') {
    bgColor = 'bg-gradient-to-r from-red-600 to-red-200';
  }

  let cardCSS = 'text-white w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md';
  if (!isValid) {
    cardCSS = 'w-[210px] p-5 rounded-xl text-gray-400'
    bgColor = 'bg-gray-200'
  } else {
    cardCSS = 'text-white w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md';
  }

  return (
    <div onClick={handleCacheCreditClick} className={`${cardCSS} ${bgColor}`}>
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
        <div className={`${isValid ? 'text-gray-600' : 'text-gray-400'}`}>
          <h3 className="text-xs"> Valid Till </h3>
          <p className={`${isValid ? 'font-semibold text-sm' : 'text-sm text-red-500'}`}> {
              isValid ? "14/6/25" : "Expired!"
            } </p>
        </div>
      </div>
    </div>
  );
};

export default CacheCreditCard;
