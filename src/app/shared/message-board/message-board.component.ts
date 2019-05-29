import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BehaviorSubject, combineLatest, Observable, of as observableOf, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  find,
  first,
  flatMap,
  map,
  mergeMap,
  reduce,
  startWith,
  take,
  withLatestFrom
} from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { Bitstream } from '../../core/shared/bitstream.model';
import { MessageService } from '../../core/message/message.service';
import { NotificationsService } from '../notifications/notifications.service';
import { hasValue, isNotEmpty } from '../empty.util';
import { Item } from '../../core/shared/item.model';
import { RemoteData } from '../../core/data/remote-data';
import { MessageDataResponse } from '../../core/message/message-data-response';
import { AppState } from '../../app.reducer';
import { getAuthenticatedUser } from '../../core/auth/selectors';
import { EPerson } from '../../core/eperson/models/eperson.model';

@Component({
  selector: 'ds-message-board',
  styleUrls: ['./message-board.component.scss'],
  templateUrl: './message-board.component.html',
  providers: [
    NgbActiveModal,
  ]
})

export class MessageBoardComponent implements OnChanges, OnDestroy {
  @Input() dso: any;
  @Input() tooltipMessage: string;
  @Output() refresh = new EventEmitter<any>();

  public submitter$: Observable<EPerson>;
  public user$: Observable<EPerson>;
  public unreadMessages$: BehaviorSubject<Bitstream[]> = new BehaviorSubject<Bitstream[]>([]);
  public modalRef: NgbModalRef;
  public itemUUID: string;
  public messages$:  BehaviorSubject<Bitstream[]> = new BehaviorSubject<Bitstream[]>([]);
  public isSubmitter$: Observable<boolean>;
  public messageForm: FormGroup;
  public processingMessage = false;

  private subs: Subscription[] = [];
  private rememberEmitUnread = false;
  private rememberEmitRead = false;

  constructor(protected cdr: ChangeDetectorRef,
              private formBuilder: FormBuilder,
              public msgService: MessageService,
              private modalService: NgbModal,
              private notificationsService: NotificationsService,
              private store: Store<AppState>,
              private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (hasValue(changes.dso.isFirstChange())) {
      this.user$ = this.store.pipe(
        select(getAuthenticatedUser),
        find((user: EPerson) => isNotEmpty(user)),
        map((user: EPerson) => user));

      this.submitter$ = (this.dso.submitter as Observable<RemoteData<EPerson[]>>).pipe(
        find((rd: RemoteData<EPerson>) => rd.hasSucceeded && isNotEmpty(rd.payload)),
        map((rd: RemoteData<EPerson>) => rd.payload));

      this.isSubmitter$ = combineLatest(this.user$, this.submitter$).pipe(
        filter(([user, submitter]) => isNotEmpty(user) && isNotEmpty(submitter)),
        map(([user, submitter]) => user.uuid === submitter.uuid));
    }

    if (hasValue(changes.dso)) {
      this.dso.item.pipe(
        filter((rd: RemoteData<Item>) => (rd.hasSucceeded && isNotEmpty(rd.payload))),
        take(1),
        map((rd: RemoteData<Item>) => rd.payload),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
        .subscribe((item) => {
          this.itemUUID = item.uuid;
          this.initMessages(item);

          // set formGroup
          this.messageForm = this.formBuilder.group({
            textSubject: ['', Validators.required],
            textDescription: ['', Validators.required]
          });
        });
    }
  }

  initMessages(item: Item) {
    item.getBitstreamsByBundleName('MESSAGE').pipe(
      filter((bitStreams: Bitstream[]) => isNotEmpty(bitStreams)),
      distinctUntilChanged((a, b) => a.length === b.length),
      startWith([]),
      distinctUntilChanged())
      .subscribe((messages: Bitstream[]) => {
        this.messages$.next(messages);
        this.initUnreadMessages(messages);
      });
  }

  initUnreadMessages(messages: Bitstream[]) {
    observableOf(messages).pipe(
      filter((bitStreams: Bitstream[]) => isNotEmpty(bitStreams)),
      flatMap((bitStreams: Bitstream[]) => bitStreams),
      flatMap((bitStream: Bitstream) =>
        observableOf(bitStream).pipe(
          withLatestFrom(this.isUnread(bitStream))
        )
      ),
      filter(([bitStream, isUnread]) => isUnread),
      map(([bitStream, isUnread]) => bitStream),
      reduce((acc: any, value: any) => [...acc, ...value], []),
      startWith([]))
      .subscribe((unreadMessages: Bitstream[]) => {
        this.unreadMessages$.next(unreadMessages)
      });
  }

  sendMessage(itemUUID) {
    this.processingMessage = true;
    const subject: string = this.messageForm.get('textSubject').value;
    const description: string = this.messageForm.get('textDescription').value;
    const body = {
      uuid: itemUUID,
      subject,
      description
    };
    this.subs.push(
      this.msgService.createMessage(body).pipe(
        first()
      ).subscribe((res: MessageDataResponse) => {
        this.processingMessage = false;
        this.modalRef.dismiss('Send Message');
        if (res.hasSucceeded) {
          // Refresh event
          this.refresh.emit('read');
          this.notificationsService.success(null,
            this.translate.get('submission.workflow.tasks.generic.success'));
        } else {
          this.notificationsService.error(null,
            this.translate.get('submission.workflow.tasks.generic.error'));
        }
      })
    );
  }

  markAsUnread(msgUUID: string) {
    if (msgUUID) {
      const body = {
        uuid: msgUUID
      };
      this.subs.push(
        this.msgService.markAsUnread(body).pipe(
          find((res) => res.hasSucceeded)
        ).subscribe((res) => {
          if (!res.error) {
            this.rememberEmitUnread = true;
            this.rememberEmitRead = false;
          } else {
            this.notificationsService.error(null, this.translate.get('submission.workflow.tasks.generic.error'));
          }
        })
      );
    }
  }

  emitRefresh() {
    if (this.rememberEmitUnread && !this.rememberEmitRead) {
      // Refresh event for Unread
      this.refresh.emit('unread');
    } else if (!this.rememberEmitUnread && this.rememberEmitRead) {
      // Refresh event for Read
      this.refresh.emit('read');
    }
  }

  markAsRead(msgUUID?: string) {
    let ids$: Observable<string[]>;
    if (msgUUID) {
      ids$ = observableOf([msgUUID]);
    } else {
      ids$ = this.unreadMessages$.pipe(
        filter((messages: Bitstream[]) => isNotEmpty(messages)),
        flatMap((message: Bitstream) => message.uuid),
        reduce((acc: any, value: any) => [...acc, ...value], []),
        startWith([])
      )
    }

    this.subs.push(
      ids$.pipe(
        filter((uuids) => isNotEmpty(uuids)),
        mergeMap((uuid: any) => {
          const body = { uuid };
          return this.msgService.markAsRead(body)
        })
      ).subscribe((res: MessageDataResponse) => {
        if (res.hasSucceeded) {
          this.rememberEmitRead = true;
          this.rememberEmitUnread = false;
        } else {
          this.notificationsService.error(null, this.translate.get('submission.workflow.tasks.generic.error'));
        }
      })
    );

  }

  isUnread(m: Bitstream): Observable<boolean> {
    const accessioned = m.firstMetadataValue('dc.date.accessioned');
    const type = m.firstMetadataValue('dc.type');
    return this.isSubmitter$.pipe(
      filter((isSubmitter) => isNotEmpty(isSubmitter)),
      map((isSubmitter) => (!accessioned &&
        ((isSubmitter && type === 'outbound') || (!isSubmitter && type === 'inbound')))
      ),
      startWith(false));
  }

  openMessageBoard(content) {
    this.rememberEmitUnread = false;
    this.rememberEmitRead = false;
    this.markAsRead();
    this.modalRef = this.modalService.open(content, { size: 'lg' });
    this.modalRef.result.then((result) => {
      this.emitRefresh();
    }, (reason) => {
      this.emitRefresh();
    });
  }

  trackByFn(index, item) {
    return index; // or item.id
  }

  ngOnDestroy() {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

}
