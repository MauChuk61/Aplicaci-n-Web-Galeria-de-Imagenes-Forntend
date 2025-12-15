import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageEventsService {
  private messageReadSource = new Subject<void>();
  messageRead$ = this.messageReadSource.asObservable();

  emitMessageRead() {
    this.messageReadSource.next();
  }
}
