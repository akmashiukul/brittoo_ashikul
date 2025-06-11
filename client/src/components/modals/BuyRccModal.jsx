import useUserStore from "../../stores/authStores/useUserStore";
import useBuyRccModalStore from "../../stores/creditModalStores/useBuyRccModalStore";


const BuyRccModal = () => {
  
  const { currentUser } = useUserStore();
  const { isRccModalOpen } = useBuyRccModalStore();
  
  if (!isRccModalOpen || !currentUser) return null;
  
  return (
    <div>BuyRccModal</div>
  )
}

export default BuyRccModal