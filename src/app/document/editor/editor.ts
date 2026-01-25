import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DocumentDto } from '../../../models/document.model';

@Component({
    selector: 'app-editor',
    imports: [FormsModule],
    templateUrl: './editor.html',
    styleUrl: './editor.css',
})
export class Editor {
    route = inject(ActivatedRoute);

    content = signal('');

    constructor() {
        this.route.data.subscribe((data) => {
            this.content = data['document'].content;
        });
    }
}
