import type { AuthError } from "@supabase/supabase-js";

// Supabase returns auth errors in English. Map the ones an Operator can hit on
// the login / signup forms to Spanish, keyed by the stable `code` field. Codes
// not listed here fall through to message matching and then a generic message.
const MESSAGES_BY_CODE: Record<string, string> = {
	email_address_invalid: "El email no es válido.",
	email_address_not_authorized: "Ese email no está autorizado.",
	email_exists: "Ya existe una cuenta con ese email.",
	email_not_confirmed:
		"Todavía no confirmaste tu email. Revisá tu casilla de correo.",
	invalid_credentials: "Email o contraseña incorrectos.",
	over_email_send_rate_limit:
		"Demasiados intentos. Esperá un momento e intentá de nuevo.",
	over_request_rate_limit:
		"Demasiados intentos. Esperá un momento e intentá de nuevo.",
	request_timeout: "La conexión tardó demasiado. Probá de nuevo.",
	signup_disabled: "El registro no está habilitado por ahora.",
	user_already_exists: "Ya existe una cuenta con ese email.",
	user_banned: "Tu cuenta fue suspendida.",
	validation_failed: "Revisá los datos ingresados.",
	weak_password: "La contraseña es muy débil. Usá al menos 6 caracteres.",
};

// Fallback for older responses that carry an English message but no `code`.
const MESSAGE_PATTERNS: [RegExp, string][] = [
	[/invalid login credentials/i, MESSAGES_BY_CODE.invalid_credentials],
	[/email not confirmed/i, MESSAGES_BY_CODE.email_not_confirmed],
	[
		/already registered|already exists|user exists/i,
		MESSAGES_BY_CODE.email_exists,
	],
	[
		/password.*(6|at least|weak)|weak password/i,
		MESSAGES_BY_CODE.weak_password,
	],
	[/rate limit/i, MESSAGES_BY_CODE.over_request_rate_limit],
	[/invalid.*email|email.*invalid/i, MESSAGES_BY_CODE.email_address_invalid],
];

const NETWORK_MESSAGE =
	"No pudimos conectar. Revisá tu internet e intentá de nuevo.";
const GENERIC_MESSAGE = "Algo salió mal. Probá de nuevo en un momento.";

// Codes the auth callback redirects to /login with (e.g. an expired or reused
// email confirmation link) so the Operator gets feedback instead of a blank form.
const CALLBACK_MESSAGES: Record<string, string> = {
	auth_callback_failed:
		"El link de confirmación venció o ya se usó. Ingresá para pedir uno nuevo.",
};

export const getCallbackErrorMessage = (code: string): string =>
	CALLBACK_MESSAGES[code] ?? GENERIC_MESSAGE;

export const getAuthErrorMessage = (error: AuthError): string => {
	if (error.code && MESSAGES_BY_CODE[error.code]) {
		return MESSAGES_BY_CODE[error.code];
	}

	for (const [pattern, message] of MESSAGE_PATTERNS) {
		if (pattern.test(error.message)) return message;
	}

	// Network failures surface as AuthRetryableFetchError with no useful code.
	if (
		error.name === "AuthRetryableFetchError" ||
		(typeof navigator !== "undefined" && !navigator.onLine)
	) {
		return NETWORK_MESSAGE;
	}

	return GENERIC_MESSAGE;
};
