import { create } from 'zustand';

const useRequestWithdrawalModalStore = create((set) => ({
  isRequestWithdrawalModalOpen: false,
  bccWallet: null,

  openRequestWithdrawalModal: (bccWallet) => set({ isRequestWithdrawalModalOpen: true, bccWallet: bccWallet}),
  closeRequestWithdrawalModal: () => set({ isRequestWithdrawalModalOpen: false, bccWallet: null}),

}));

export default useRequestWithdrawalModalStore;