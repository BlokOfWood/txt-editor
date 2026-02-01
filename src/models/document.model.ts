export type DocumentBriefsDto = {
    documentBriefs: DocumentBrief[];
    totalDocumentCount: number;
};

export type DocumentBrief = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export type DocumentDto = {
    title: string;
    content: string;
};

export type CreateDocumentDto = {
    title: string;
    content?: string;
};

export type ModifyDocumentDto = {
    title?: string;
    content?: string;
};
