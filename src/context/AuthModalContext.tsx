import { createContext, useState } from "react";

type ModalType = "login" | "register" | null;

const AuthModalContext = createContext({
	isOpen: false as boolean,
	modalType: null as ModalType,
	openModal: (type: "login" | "register") => {},
	closeModal: () => {},
});

export const AuthModalProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState<ModalType>(null);

	const openModal = (type: "login" | "register") => {
		setModalType(type);
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
		setModalType(null);
	};

	return (
		<AuthModalContext.Provider
			value={{ isOpen, modalType, openModal, closeModal }}
		>
			{children}
		</AuthModalContext.Provider>
	);
};

export default AuthModalContext;
