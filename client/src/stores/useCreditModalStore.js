import { create } from 'zustand';

const useCreditModalStore = create((set) => ({
  isCreditModalOpen: false,
  openCreditModal: () => set({ isCreditModalOpen: true}),
  closeCreditModal: () => set({ isCreditModalOpen: false}),
}));

export default useCreditModalStore;