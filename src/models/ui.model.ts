export type MessageType = 'error' | 'info';
export type Message = { message: string; type: MessageType } | null;
export type MessageKey = keyof typeof messages | null;

export const messages = {
    DUPLICATE_TITLE: { type: 'error', message: 'A document with this title already exists.' },
    NO_IMPORTABLE_FILE: { type: 'error', message: 'No importable file provided!' },
    LOGIN_SUCCESSFUL: { message: 'Login successful!', type: 'info' },
    CONNECTION_FAILED: { message: 'Could not connect to server.', type: 'error' },
    INVALID_LOGIN: { message: 'Invalid username or password.', type: 'error' },
    UNKNOWN_ERROR: { message: `An unknown error occurred.`, type: 'error' },
    PASSWORDS_DONT_MATCH: { message: 'Passwords do not match.', type: 'error' },
    SUCCESSFUL_REGISTRATION: {
        message: 'Registration successful! You will now be redirected to the login page.',
        type: 'info',
    },
    USERNAME_DUPLICATE: { message: 'Username already exists.', type: 'error' },
    SERVER_ERROR: { message: 'A server error occurred. Please try again later.', type: 'error' },
};
