import Banner from "../components/HomePage/Banner";
import FAQ from "../components/HomePage/FAQ";
import HowBrittooWorks from "../components/HomePage/HowBrittooWorks";
import RecentListings from "../components/HomePage/RecentListings";

const Home = ({ setProductType, setSearch }) => {
  return (
    <div className="bg-white">
      <Banner setProductType={setProductType} setSearch={setSearch}/>
      <RecentListings />
      <HowBrittooWorks />
      <FAQ />
    </div>
  );
};

export default Home;
