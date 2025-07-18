import Banner from "../components/HomePage/Banner";

const Home = ({ setProductType, setSearch }) => {
  return (
    <div>
      <Banner setProductType={setProductType} setSearch={setSearch}/>
    </div>
  );
};

export default Home;
