import { create } from 'zustand';

const useBuyRccModalStore = create((set) => ({
  isBuyRccModalOpen: false,
  openBuyRccModal: () => set({ isBuyRccModalOpen: true}),
  closeBuyRccModal: () => set({ isBuyRccModalOpen: false}),
}));

export default useBuyRccModalStore;