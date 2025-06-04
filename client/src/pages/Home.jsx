import Banner from "../components/HomePage/Banner"
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