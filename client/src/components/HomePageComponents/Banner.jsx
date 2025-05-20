import { IoSearchCircle } from "react-icons/io5";

const Banner = () => {

  const tagClassNames = "border border-gray-300 rounded-3xl py-[6px] px-4 text-gray-800 font-semibold bg-white cursor-pointer hover:bg-green-200 md:text-sm text-xs";

  return (
    <div className="bg-gradient-to-b from-green-100 to-transparent">
      <div
        className="flex flex-col items-center justify-center min-h-screen mx-auto lg:max-w-7xl"
      >
        <h1 className="text-2xl md:text-7xl font-bold">
          <span className="text-green-600">Own Less,</span> Access More
        </h1>
        <p className="text-gray-500 text-xl mt-8 text-center">
          Rent, Barter, and Share items in your community. Earn credits by{" "}
          <br /> lending your items or pay with cash. Join the circular economy
          today.
        </p>
        <div className="flex gap-4 mt-8">
          <button className="py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 hidden md:block px-6">
            Find Items to Rent
          </button>
          <button className="text-xs md:text-base mr-3 border lg:mr-0 py-2 border-green-500 hover:text-gray-500 text-green-500 hover:bg-green-100 rounded-lg cursor-pointer bg-transparent px-6">
            List Your Items
          </button>
        </div>
          <div className="relative mt-8">
            <input
              type="text"
              id="Search"
              className="border bg-white border-gray-300 rounded-3xl w-[700px] py-3 px-4 focus:border-green-600 focus:outline-none"
              placeholder="What do you want to rent?"
            />

            <span className="absolute inset-y-0 right-2 grid w-8 place-content-center">
              <IoSearchCircle className="text-green-600 cursor-pointer" size={48} />
            </span>
          </div>
          <ul className="mt-8 flex gap-4">
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
  );
};

export default Banner;
