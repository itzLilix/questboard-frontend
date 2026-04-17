export class AppError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AppError";
	}
}

export class ApiError extends AppError {
	public status?: number;

	constructor(message: string, status?: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}
