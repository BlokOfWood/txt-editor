import {
    Component,
    computed,
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
import { DocumentBrief, DocumentBriefsDto } from '../../../models/document.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageComponent } from '../../reusable-components/message/message';
import { catchError, debounceTime, firstValueFrom, Subscription, tap } from 'rxjs';
import { ArrowLeft, ArrowRight, LucideAngularModule, Trash2 } from 'lucide-angular';
import { toObservable } from '@angular/core/rxjs-interop';

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
    static readonly DOCUMENTS_PER_PAGE = 50;

    private documentApi = inject(DocumentApi);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    readonly TrashIcon = Trash2;
    readonly ArrowLeft = ArrowLeft;
    readonly ArrowRight = ArrowRight;

    message: WritableSignal<MessageKey> = signal(null);

    documentResponse: WritableSignal<DocumentBriefsDto> = signal({
        documentBriefs: [],
        totalDocumentCount: 0,
    });
    documents = computed(() =>
        this.documentResponse().documentBriefs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            updatedAt: new Date(doc.updatedAt),
            createdAt: new Date(doc.createdAt),
        })),
    );

    currentPageNumber = signal(1);
    totalPageCount = computed(() =>
        Math.ceil(this.documentResponse().totalDocumentCount / Dashboard.DOCUMENTS_PER_PAGE),
    );

    searchString = signal('');

    deleteDialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteConfirmDialog');
    toBeDeletedDocument = signal<DocumentBrief | null>(null);

    nameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('nameDialog');
    nameDialogMessage: WritableSignal<MessageKey> = signal(null);
    newDocumentName = signal('');

    changePageNumber() {
        const newValue = this.currentPageNumber();

        if (newValue === null || Number.isNaN(newValue)) return;

        if (newValue < 1) this.currentPageNumber.set(1);
        else if (newValue > this.totalPageCount())
            this.currentPageNumber.set(this.totalPageCount());
        else if (newValue % 1 !== 0) {
            this.currentPageNumber.set(Math.floor(newValue));
        }

        this.updateDocumentBriefs();
    }

    goToPrevPage() {
        if (this.currentPageNumber() == 1) {
            return;
        }

        this.currentPageNumber.update((pageNumber) => pageNumber - 1);

        this.updateDocumentBriefs();
    }

    goToNextPage() {
        if (this.currentPageNumber() == this.totalPageCount()) {
            return;
        }

        this.currentPageNumber.update((pageNumber) => pageNumber + 1);

        this.updateDocumentBriefs();
    }

    openDeleteDialog(idx: number) {
        this.toBeDeletedDocument.set(this.documentResponse().documentBriefs[idx]);
        this.deleteDialog().nativeElement.showModal();
    }

    closeDeleteDialog() {
        this.toBeDeletedDocument.set(null);
        this.deleteDialog().nativeElement.close();
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

    openNameDialog() {
        this.nameDialogMessage.set(null);
        this.newDocumentName.set('');

        this.nameDialog().nativeElement.showModal();
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
                    this.updateDocumentBriefs();
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
            .getDocumentBriefs(
                this.searchString(),
                Dashboard.DOCUMENTS_PER_PAGE * (this.currentPageNumber() - 1),
                Dashboard.DOCUMENTS_PER_PAGE,
                this.destroyRef,
            )
            .subscribe({
                next: (documentBriefs) => {
                    this.documentResponse.set(documentBriefs);
                },
            });
    }

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

    handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    constructor() {
        this.route.data.subscribe((data) => {
            this.documentResponse.set(data['documents']);
        });

        toObservable(this.searchString)
            .pipe(debounceTime(500))
            .subscribe(() => this.updateDocumentBriefs());
    }
}
