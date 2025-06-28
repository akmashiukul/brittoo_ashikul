import brittoofav from '../../assets/brittoofav.png';
import useUserStore from '../../stores/authStores/useUserStore';

const BCC = ({bcc}) => {
  const { currentUser } = useUserStore();
  return (
    <div className="text-black w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md bg-gradient-to-r from-blue-400 to-blue-100">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xs md:text-sm"> CC Amount </h2>
          <p className="text-lg md:text-xl font-bold"> {bcc} </p>
        </div>
        <img src={brittoofav} alt="fav" className="w-12 h-12" />
      </div>

      <div className="flex justify-between mt-5">
        <div>
          <h3 className="text-sm font-medium"> Edu-mail </h3>
          <p className="text-xs italic"> { currentUser.email } </p>
        </div>
      </div>
    </div>
  );
};

export default BCC;
