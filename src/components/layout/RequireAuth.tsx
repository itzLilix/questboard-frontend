import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import Loading from "../ui/Loading";

const RequireAuth = () => {
	const { user, isLoading } = useContext(AuthContext);
	const location = useLocation();

	if (isLoading)
		return (
			<Loading className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
		);
	if (!user)
		return (
			<Navigate
				to="/"
				replace
				state={{ from: location, authRequired: true }}
			/>
		);

	return <Outlet />;
};

export default RequireAuth;
