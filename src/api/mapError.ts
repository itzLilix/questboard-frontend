import { isAxiosError } from "axios";
import { ApiError, AppError } from "../types/errors";

export function mapError(error: unknown): AppError {
	if (isAxiosError(error)) {
		return new ApiError(
			error.response?.data?.message || "Ошибка",
			error.response?.status,
		);
	} else if (error instanceof Error) {
		return new AppError(error.message);
	}

	return new AppError("Неизвестная ошибка");
}
