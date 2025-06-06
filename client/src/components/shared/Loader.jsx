import { PacmanLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white opacity-80">
      <div className="flex flex-col gap-4 w-full justify-center text-center items-center z-50">
        <h4 className="text-green-500 text-3xl sm:text-5xl font-bold">
          Loading...
        </h4>
        <p className="text-black">
          This delay is temporary, unlike your backlogs 😉
        </p>
        <PacmanLoader color="#22c55e" />
      </div>
    </div>
  );
};

export default Loader;
