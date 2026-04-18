import { createContext, useState } from "react";

type ModalType = "login" | "register" | null;

const AuthModalContext = createContext({
	isOpen: false as boolean,
	modalType: null as ModalType,
	openAuthModal: (type: "login" | "register") => {},
	closeAuthModal: () => {},
});

export const AuthModalProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
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
};

export default AuthModalContext;
