import { create } from "zustand";

type ModalType = "login" | "register" | null;

type AuthModalStore = {
	isOpen: boolean;
	modalType: ModalType;
	open: (type: "login" | "register") => void;
	close: () => void;
};

export const useAuthModal = create<AuthModalStore>((set) => ({
	isOpen: false,
	modalType: null,
	open: (modalType) => set({ isOpen: true, modalType }),
	close: () => set({ isOpen: false, modalType: null }),
}));
