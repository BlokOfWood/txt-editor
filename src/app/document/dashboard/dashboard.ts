import {
    Component,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { DocumentApi } from '../../services/api/document.api';
import { FormsModule } from '@angular/forms';
import { MessageKey } from '../../../models/ui.model';
import { DocumentBriefDto } from '../../../models/document.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageComponent } from '../../reusable-components/message/message';
import { catchError, firstValueFrom, Subscription, tap } from 'rxjs';
import { LucideAngularModule, Trash2 } from 'lucide-angular';

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, RouterLink, MessageComponent, LucideAngularModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
    host: {
        '(drop)': 'handleDrop($event)',
        '(dragover)': 'handleDragOver($event)',
    },
})
export class Dashboard {
    private documentApi = inject(DocumentApi);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    readonly TrashIcon = Trash2;

    deleteDialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteConfirmDialog');
    toBeDeletedDocument = signal<DocumentBriefDto | null>(null);

    nameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('nameDialog');
    nameDialogMessage: WritableSignal<MessageKey> = signal(null);

    message: WritableSignal<MessageKey> = signal(null);
    newDocumentName = signal('');
    documents: WritableSignal<DocumentBriefDto[]> = signal([]);

    async handleDrop(event: DragEvent) {
        event.preventDefault();

        if (!event.dataTransfer) return;

        const files = [...event.dataTransfer.items]
            .map((item) => item.getAsFile())
            .filter((item) => item !== null);

        if (files.length === 0) return;

        const textFiles = files.filter((file) => file.type === 'text/plain');

        if (textFiles.length === 0) {
            this.message.set('NO_IMPORTABLE_FILE');
            return;
        }

        this.message.set(null);

        let addedFileCount = 0;

        try {
            Promise.all(
                files.map(async (file) =>
                    firstValueFrom(
                        this.documentApi
                            .createNewDocument(
                                {
                                    title: file.name.endsWith('.txt')
                                        ? file.name.slice(0, -4)
                                        : file.name,
                                    content: await file.text(),
                                },
                                this.destroyRef,
                            )
                            .pipe(
                                tap(() => addedFileCount++),
                                catchError(() => [{}]),
                            ),
                    ),
                ),
            ).then(() => {
                if (addedFileCount !== 0) this.updateDocumentBriefs();

                if (addedFileCount === 0) this.message.set('NO_IMPORTABLE_FILE');
                else if (addedFileCount !== textFiles.length)
                    this.message.set('SOME_FILES_UNIMPORTABLE');
                else this.message.set('ALL_FILES_SUCCESSFULLY_IMPORTED');
            });
        } catch (error) {
            console.error('Failed to read files!', error);
            this.message.set('FILE_READ_FAIL');
        }
    }

    openDeleteDialog(idx: number) {
        this.deleteDialog().nativeElement.showModal();
        this.toBeDeletedDocument.set(this.documents()[idx]);
    }

    submitDeleteDocRequest() {
        const documentToBeDeleted = this.toBeDeletedDocument();
        if (documentToBeDeleted === null) {
            throw 'Tried to delete document when none where opened.';
        }

        this.documentApi.deleteDocument(documentToBeDeleted.id, this.destroyRef).subscribe({
            next: () => {
                this.updateDocumentBriefs();
                this.closeDeleteDialog();
                this.message.set('SUCCESSFUL_DELETE');
            },
            error: () => {
                this.message.set('FAILED_TO_DELETE');
            },
        });
    }

    closeDeleteDialog() {
        this.toBeDeletedDocument.set(null);
        this.deleteDialog().nativeElement.close();
    }

    handleDragOver(event: DragEvent) {
        //console.log(event)
        event.preventDefault();
    }

    openNameDialog() {
        this.nameDialogMessage.set(null);

        this.nameDialog().nativeElement.showModal();
        this.newDocumentName.set('');
    }

    closeNameDialog() {
        this.nameDialog().nativeElement.close();
    }

    submitNewDocRequest() {
        this.documentApi
            .createNewDocument({ title: this.newDocumentName() }, this.destroyRef)
            .subscribe({
                next: () => {
                    this.closeNameDialog();

                    this.documentApi.getDocumentBriefs(this.destroyRef).subscribe({
                        next: (newDocuments) => {
                            this.documents.set(newDocuments);
                        },
                    });
                },
                error: (err: HttpErrorResponse) => {
                    if (err.status === 409) {
                        this.nameDialogMessage.set('DUPLICATE_TITLE');
                        console.log(err);
                    } else {
                        throw err;
                    }
                },
            });
    }

    private briefsUpdateSubscription: Subscription | null = null;

    updateDocumentBriefs() {
        this.briefsUpdateSubscription?.unsubscribe();

        this.briefsUpdateSubscription = this.documentApi
            .getDocumentBriefs(this.destroyRef)
            .subscribe({
                next: (documentBriefs) => {
                    this.documents.set(documentBriefs);
                },
            });
    }

    constructor() {
        this.route.data.subscribe((data) => {
            this.documents.set(data['documents']);
        });
    }
}
