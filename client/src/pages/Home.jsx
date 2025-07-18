import Banner from "../components/HomePage/Banner";
import RecentListings from "../components/HomePage/RecentListings";

const Home = ({ setProductType, setSearch }) => {
  return (
    <div>
      <Banner setProductType={setProductType} setSearch={setSearch}/>
      <RecentListings />
    </div>
  );
};

export default Home;
