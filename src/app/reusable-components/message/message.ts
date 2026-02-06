import { Component, computed, input } from '@angular/core';
import { messages } from '../../../models/message.model';

@Component({
    selector: 'message',
    imports: [],
    templateUrl: './message.html',
    styleUrl: './message.css',
})
export class MessageComponent {
    messageKey = input.required<keyof typeof messages | null>();
    message = computed(() => {
        const key = this.messageKey();
        return key === null ? null : messages[key];
    });
}
