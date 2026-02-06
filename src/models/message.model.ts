export type MessageType = 'error' | 'info';
export type Message = { message: string; type: MessageType } | null;
export type MessageKey = keyof typeof messages | null;

export const messages = {
    // Login
    LOGIN_SUCCESSFUL: { message: 'Login successful!', type: 'info' },
    INVALID_LOGIN: { message: 'Invalid username or password.', type: 'error' },

    // Register
    USERNAME_DUPLICATE: { message: 'Username already exists.', type: 'error' },
    PASSWORDS_DONT_MATCH: { message: 'Passwords do not match.', type: 'error' },
    SUCCESSFUL_REGISTRATION: {
        message: 'Registration successful! You will now be redirected to the login page.',
        type: 'info',
    },

    // Document creation
    DUPLICATE_TITLE: { type: 'error', message: 'A document with this title already exists.' },

    // Document deletion
    DELETE_FAIL: { message: 'Failed to delete document.', type: 'error' },
    DELETE_SUCCESSFUL: { message: 'Successfully deleted document', type: 'info' },

    // Document import
    NO_IMPORTABLE_FILE: { type: 'error', message: 'No importable file provided!' },
    SOME_FILES_UNIMPORTABLE: { type: 'error', message: 'Some files could not be imported!' },
    ALL_FILES_SUCCESSFULLY_IMPORTED: {
        type: 'info',
        message: 'All files were successfully imported!',
    },
    FILE_READ_FAIL: { message: 'Failed to read some provided files.', type: 'error' },

    // Encryption
    LOGOUT_ENCRYPTION_KEY_INVALID: {
        message:
            'You have been logged out because the encryption key in memory is incorrect.<br>Login again to set your encryption key again.',
        type: 'error',
    },

    // Generic
    CONNECTION_FAILED: { message: 'Could not connect to server.', type: 'error' },
    UNKNOWN_ERROR: { message: `An unknown error occurred.`, type: 'error' },
    SERVER_ERROR: { message: 'A server error occurred. Please try again later.', type: 'error' },
};
