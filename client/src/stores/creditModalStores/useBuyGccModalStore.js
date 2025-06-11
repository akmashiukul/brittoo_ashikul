import { create } from 'zustand';

const useBuyGccModalStore = create((set) => ({
  isBuyGccModalOpen: false,
  openBuyGccModal: () => set({ isBuyGccModalOpen: true}),
  closeBuyGccModal: () => set({ isBuyGccModalOpen: false}),
}));

export default useBuyGccModalStore;