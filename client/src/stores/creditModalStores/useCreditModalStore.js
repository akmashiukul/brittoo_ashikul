import { create } from 'zustand';

const useCreditModalStore = create((set) => ({
  isCreditModalOpen: false,
  requiredDeposit: 0,

  openCreditModal: (amount) => set({ isCreditModalOpen: true, requiredDeposit: amount}),
  closeCreditModal: () => set({ isCreditModalOpen: false, requiredDeposit: 0}),

}));

export default useCreditModalStore;