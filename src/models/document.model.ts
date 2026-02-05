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
    content: string; // base64
    initializationVector: string; // base64
};

export type CreateDocumentDto = {
    title: string;
    content: string; // base64
    initializationVector: string; // base64
};

export type ModifyDocumentDto =
    | {
          title: string;
      }
    | {
          content: string;
          initializationVector: string;
      };
