export const USER_REGEX = /^[A-Za-z0-9-_]{2,32}$/;
export const PWD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])[A-Za-z0-9!@#$%]{8,128}$/;
export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export const emailRules = {
	required: "Электронная почта обязательна",
	pattern: {
		value: EMAIL_REGEX,
		message: "Некорректный email",
	},
};

export const usernameRules = {
	required: "Имя пользователя обязательно",
	pattern: {
		value: USER_REGEX,
		message: "Имя пользователя: 3-32 символа, буквы и цифры",
	},
};

export const displayNameRules = {
	maxLength: {
		value: 100,
		message: "Отображаемое имя: не более 100 символов",
	},
};

export const bioRules = {
	maxLength: {
		value: 500,
		message: "О себе: не более 500 символов",
	},
};

export const passwordRules = ({ strong }: { strong: boolean }) => ({
	required: "Пароль обязателен",
	...(strong
		? {
				pattern: {
					value: PWD_REGEX,
					message: "Пароль: 8-128 символов, буквы, цифры и !@#$%",
				},
			}
		: {}),
});
