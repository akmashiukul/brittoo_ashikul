import Banner from "../components/HomePage/Banner";
import HowBrittooWorks from "../components/HomePage/HowBrittooWorks";
import RecentListings from "../components/HomePage/RecentListings";

const Home = ({ setProductType, setSearch }) => {
  return (
    <div>
      <Banner setProductType={setProductType} setSearch={setSearch}/>
      <RecentListings />
      <HowBrittooWorks />
    </div>
  );
};

export default Home;
