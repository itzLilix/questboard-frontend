import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./useAuth";
import Loading from "../../components/ui/Loading";

export default function RequireAuth() {
	const { user, isLoading } = useAuth();
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
}
