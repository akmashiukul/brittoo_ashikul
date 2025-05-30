import Banner from "../components/HomePageComponents/Banner"
import useUserStore from "../stores/useUserStore"

const Home = () => {
  const { currentUser } = useUserStore();
  console.log(currentUser)
  return (
    <div>
      <Banner />
    </div>
  )
}

export default Home