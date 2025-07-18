import { IoSearchCircle } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

const Banner = ({ setProductType, setSearch }) => {
  const navigate = useNavigate();
  const tagClassNames = `border border-gray-300 rounded-3xl py-[6px] px-4 text-gray-800 font-semibold bg-white cursor-pointer hover:bg-green-200 md:text-sm text-xs`;

  return (
    <div className="bg-gradient-to-b from-green-100 to-transparent">
      <div className="flex flex-col items-center mx-auto lg:max-w-7xl">
        <h1 className="text-2xl md:text-7xl font-bold mt-14 sm:mt-24">
          <span className="text-green-500">Own Less,</span> Access More
        </h1>
        <p className="text-gray-500  text-xs md:text-xl mt-4 sm:mt-8 text-center mx-2 md:mx-0">
          Rent, Barter, and Share items in your community. Earn credits by{" "}
          <br className="hidden md:block" /> lending your items or pay with
          cash. Join the circular economy today.
        </p>
        <div className="text-xs md:text-base flex flex-col md:flex-row items-center gap-4 mt-8">
          <Link to={'/browse'} className="py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 px-6">
            Find Items to Rent
          </Link>
          <Link to={'/dashboard/list-items'} className="text-xs md:text-base border py-2 border-green-500 hover:text-gray-500 text-green-500 hover:bg-green-100 rounded-lg cursor-pointer bg-transparent px-6">
            List Your Items
          </Link>
        </div>
        <div className="relative mt-8">
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            id="Search"
            className="border bg-white border-gray-300 rounded-3xl w-[250px] md:w-[400px] lg:w-[700px] px-2 py-2 md:py-3 p md:px-4 focus:border-green-600 focus:outline-none text-xs md:text-sm"
            placeholder="What do you want to rent?"
          />

          <button
            onClick={() => setTimeout(() => navigate("/browse"), 100)}
            className="absolute inset-y-0 right-0 md:right-2 grid w-8 place-content-center"
          >
            <IoSearchCircle className="text-green-500 cursor-pointer size-6 md:size-12" />
          </button>
        </div>
        <div className="w-full overflow-x-auto scrollbar-hide relative mt-8">
          <ul className="flex gap-4 whitespace-nowrap px-2 md:justify-center justify-start">
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("GADGET");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Gadgets
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("FURNITURE");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Furniture
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("VEHICLE");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Vehicles
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("STATIONARY");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Stationary
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("MUSICAL_INSTRUMENT");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Musical Instruments
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("CLOTHING");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Clothing
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("BOOK");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Books
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("ACADEMIC_BOOK");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Academic Books
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("ELECTRONICS");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Electronics
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("APARTMENTS");
                setTimeout(() => {
                  navigate("/browse");
                }, 400);
              }}
            >
              Apartments
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Banner;
