import useBuyGccModalStore from "../../stores/creditModalStores/useBuyGccModalStore";
import useUserStore from "../../stores/useUserStore";

const BuyGccModal = () => {

  const { currentUser } = useUserStore();
  const { isGccModalOpen } = useBuyGccModalStore();
  
  if (!isGccModalOpen || !currentUser) return null;

  return (
    <div>BuyGccModal</div>
  )
}

export default BuyGccModal