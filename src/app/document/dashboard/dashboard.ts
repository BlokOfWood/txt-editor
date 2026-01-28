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
import { Message, MessageKey, messages } from '../../../models/ui.model';
import { DocumentBriefDto } from '../../../models/document.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageComponent } from '../../reusable-components/message/message';

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, RouterLink, MessageComponent],
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

    nameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('nameDialog');
    nameDialogMessage: WritableSignal<MessageKey> = signal(null);

    message: WritableSignal<MessageKey> = signal(null);
    newDocumentName = signal('');
    documents: WritableSignal<DocumentBriefDto[]> = signal([]);

    handleDrop(event: DragEvent) {
        event.preventDefault();

        if (!event.dataTransfer) return;

        let files = [...event.dataTransfer.items]
            .map((item) => item.getAsFile())
            .filter((item) => item !== null);

        if (files.length === 0) return;

        files = files.filter((file) => file.type === 'text/plain');

        if (files.length === 0) {
            this.message.set('NO_IMPORTABLE_FILE');
            return;
        }

        this.message.set(null);
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

    constructor() {
        this.route.data.subscribe((data) => {
            this.documents.set(data['documents']);
        });
    }
}
