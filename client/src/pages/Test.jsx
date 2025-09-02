import Swal from "sweetalert2";
import ShowRccModal from "../components/modals/ShowRccModal";
import Loader from "../components/shared/Loader";


const Test = () => {

  const handle = () => {
    Swal.fire({
      icon: "success",
      title: "Reset Link Sent",
      text: "Please check your inbox and spam/junk folders.",
      showConfirmButton: false,
      footer: '<p>Note: Delivery may take up to 4–5 minutes. Thank you for your patience.</p>'
    });
  }
  return (
    <div className="w-full h-screen mt-6 ml-6">
      {/* <Loader /> */}
      <button onClick={handle}>click</button>
    </div>
  );
};

export default Test;
