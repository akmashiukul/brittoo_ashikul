import brittoofav from '../../assets/brittoofav.png';
import useUserStore from '../../stores/authStores/useUserStore';

const BCC = ({bcc, handleSelect, selectedBcc}) => {
  const { currentUser } = useUserStore();
  return (
    <div onClick={handleSelect} className={`text-black w-[190px]  p-4 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md ${selectedBcc > 0 ? "bg-blue-100 border-[3px] border-blue-700" : "bg-gradient-to-r from-blue-400 to-blue-100"}`}>
      <div className="flex justify-between">
        <div>
          <h2 className="text-xs"> CC Amount </h2>
          <p className="font-bold italic"> {bcc} {selectedBcc > 0 && <span className='text-red-600'> -{selectedBcc}</span>} </p>
        </div>
        <img src={brittoofav} alt="fav" className="w-12 h-12" />
      </div>

      <div className="flex justify-between mt-2">
        <div>
          <h3 className="text-sm font-medium"> Edu-mail </h3>
          <p className="text-xs italic text"> { currentUser.email } </p>
        </div>
      </div>
    </div>
  );
};

export default BCC;
