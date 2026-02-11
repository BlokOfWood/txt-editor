import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Websocket {
    init(websocketAddress: string) {
        const ws = new WebSocket(websocketAddress);
        ws.onopen = () => {
            console.log("ye")
            ws.send("Yoah");
        }

    }
}
