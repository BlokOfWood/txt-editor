export type DocumentBriefDto = {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export type DocumentDto = {
    title: string;
    content: string;
}

export type CreateDocumentDto = {
    title: string;
    content?: string;
}

export type ModifyDocumentDto = {
    title?: string;
    content?: string;
}
