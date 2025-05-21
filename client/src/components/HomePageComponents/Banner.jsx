import { IoSearchCircle } from "react-icons/io5";
import { FaArrowRightLong } from "react-icons/fa6";

const Banner = () => {
  const tagClassNames =
    "border border-gray-300 rounded-3xl py-[6px] px-4 text-gray-800 font-semibold bg-white cursor-pointer hover:bg-green-200 md:text-sm text-xs";

  return (
    <div className="bg-gradient-to-b from-green-100 to-transparent">
      <div className="flex flex-col items-center mx-auto lg:max-w-7xl">
        <h1 className="text-2xl md:text-7xl font-bold mt-14 sm:mt-24">
          <span className="text-green-600">Own Less,</span> Access More
        </h1>
        <p className="text-gray-500  text-xs md:text-xl mt-4 sm:mt-8 text-center mx-2 md:mx-0">
          Rent, Barter, and Share items in your community. Earn credits by{" "}
          <br className="hidden md:block" /> lending your items or pay with
          cash. Join the circular economy today.
        </p>
        <div className="text-xs md:text-base flex flex-col md:flex-row items-center gap-4 mt-8">
          <button className="py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 px-6">
            Find Items to Rent
          </button>
          <button className="text-xs md:text-base border py-2 border-green-500 hover:text-gray-500 text-green-500 hover:bg-green-100 rounded-lg cursor-pointer bg-transparent px-6">
            List Your Items
          </button>
        </div>
        <div className="relative mt-8">
          <input
            type="text"
            id="Search"
            className="border bg-white border-gray-300 rounded-3xl w-[250px] md:w-[400px] lg:w-[700px] px-2 py-2 md:py-3 p md:px-4 focus:border-green-600 focus:outline-none text-xs md:text-sm"
            placeholder="What do you want to rent?"
          />

          <span className="absolute inset-y-0 right-0 md:right-2 grid w-8 place-content-center">
            <IoSearchCircle className="text-green-600 cursor-pointer size-6 md:size-12" />
          </span>
        </div>
        <div className="w-full overflow-x-auto scrollbar-hide relative mt-8">
          <FaArrowRightLong className="justify-self-end text-green-500 fixed right-0 -translate-y-5 md:hidden text-sm" />
          <ul className="flex gap-4 whitespace-nowrap px-2 md:justify-center justify-start">
            <li className={tagClassNames}>Tech & Electronics</li>
            <li className={tagClassNames}>Furnitures</li>
            <li className={tagClassNames}>Vehicles</li>
            <li className={tagClassNames}>Stationary</li>
            <li className={tagClassNames}>Musical Instruments</li>
            <li className={tagClassNames}>Clothing</li>
            <li className={tagClassNames}>Books</li>
            <li className={tagClassNames}>Shoes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Banner;
