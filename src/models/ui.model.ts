export type MessageType = 'error' | 'info';
export type Message = { message: string; type: MessageType } | null;

export const messages = { DUPLICATE_TITLE: 'A document with this title already exists.' };
