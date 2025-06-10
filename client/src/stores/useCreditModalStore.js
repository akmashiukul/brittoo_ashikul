import { create } from 'zustand';

const useCreditModalStore = create((set) => ({
  isCreditModalOpen: false,
  deposit: 0,

  openCreditModal: (amount) => set({ isCreditModalOpen: true, deposit: amount}),
  closeCreditModal: () => set({ isCreditModalOpen: false, deposit: 0}),

}));

export default useCreditModalStore;