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
import { Message } from '../../../models/ui.model';
import { DocumentBriefDto } from '../../../models/document.model';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, RouterLink],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard {
    private documentApi = inject(DocumentApi);
    private destroyRef = inject(DestroyRef);

    nameDialog = viewChild.required<ElementRef<HTMLDialogElement>>('nameDialog');

    message: WritableSignal<Message> = signal(null);
    newDocumentName = signal('');
    documents: WritableSignal<DocumentBriefDto[]> = signal([]);

    openNameDialog() {
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
                },
            });
    }

    constructor() {
        this.documentApi
            .getDocumentBriefs(this.destroyRef)
            .subscribe((documentDtos) => this.documents.set(documentDtos));
    }
}
