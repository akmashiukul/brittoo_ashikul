import useUserStore from "../../stores/authStores/useUserStore";
import useBuyGccModalStore from "../../stores/creditModalStores/useBuyGccModalStore";


const BuyGccModal = () => {

  const { currentUser } = useUserStore();
  const { isGccModalOpen } = useBuyGccModalStore();
  
  if (!isGccModalOpen || !currentUser) return null;

  return (
    <div>BuyGccModal</div>
  )
}

export default BuyGccModal