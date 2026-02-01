import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../services/api/api';

@Component({
  selector: 'app-test-page',
  imports: [FormsModule],
  templateUrl: './test-page.html',
  styleUrl: './test-page.css',
})
export class TestPage {
    private destroyRef = inject(DestroyRef);
    private api = inject(Api);
    mockDocQuantity = signal(1);

    createMockDocs() {
        this.api.post(`document/mock?quantity=${this.mockDocQuantity()}`, {}, this.destroyRef).subscribe(() => console.log('success'));
    }
}
