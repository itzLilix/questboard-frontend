import { createContext, useState } from "react";

type ModalType = "login" | "register" | null;

type AuthModalContextValue = {
	isOpen: boolean;
	modalType: ModalType;
	openAuthModal: (type: "login" | "register") => void;
	closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState<ModalType>(null);

	const openAuthModal = (type: "login" | "register") => {
		setModalType(type);
		setIsOpen(true);
	};

	const closeAuthModal = () => {
		setIsOpen(false);
		setModalType(null);
	};

	return (
		<AuthModalContext.Provider
			value={{
				isOpen,
				modalType,
				openAuthModal,
				closeAuthModal,
			}}
		>
			{children}
		</AuthModalContext.Provider>
	);
}

export default AuthModalContext;
