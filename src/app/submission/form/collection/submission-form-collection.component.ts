import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { isNullOrUndefined } from 'util';
import { Collection } from '../../../core/shared/collection.model';
import { CommunityDataService } from '../../../core/data/community-data.service';
import { Community } from '../../../core/shared/community.model';
import { hasValue, isNotEmpty } from '../../../shared/empty.util';
import { RemoteData } from '../../../core/data/remote-data';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { Workspaceitem } from '../../../core/submission/models/workspaceitem.model';
import { PaginatedList } from '../../../core/data/paginated-list';
import { JsonPatchOperationsService } from '../../../core/json-patch/json-patch-operations.service';
import { SubmitDataResponseDefinitionObject } from '../../../core/shared/submit-data-response-definition.model';
import { SubmissionService } from '../../submission.service';
import { SubmissionObject } from '../../../core/submission/models/submission-object.model';
import { CollectionDataService } from '../../../core/data/collection-data.service';

interface CollectionListEntryItem {
  id: string;
  name: string;
}

interface CollectionListEntry {
  communities: CollectionListEntryItem[],
  collection: CollectionListEntryItem
}

@Component({
  selector: 'ds-submission-form-collection',
  styleUrls: ['./submission-form-collection.component.scss'],
  templateUrl: './submission-form-collection.component.html'
})
export class SubmissionFormCollectionComponent implements OnChanges, OnInit {
  @Input() currentCollectionId: string;
  @Input() currentDefinition: string;
  @Input() submissionId;

  /**
   * An event fired when a different collection is selected.
   * Event's payload equals to new collection uuid.
   */
  @Output() collectionChange: EventEmitter<Workspaceitem> = new EventEmitter<Workspaceitem>();

  public disabled = true;
  public listCollection = [];
  public model: any;
  public searchField: FormControl;
  public searchListCollection = [];
  public selectedCollectionId: string;
  public selectedCollectionName: string;

  protected pathCombiner: JsonPatchOperationPathCombiner;
  private scrollableBottom = false;
  private scrollableTop = false;
  private subs: Subscription[] = [];

  formatter = (x: { collection: string }) => x.collection;

  constructor(protected cdr: ChangeDetectorRef,
              private communityDataService: CommunityDataService,
              private collectionDataService: CollectionDataService,
              private operationsBuilder: JsonPatchOperationsBuilder,
              private operationsService: JsonPatchOperationsService<SubmitDataResponseDefinitionObject>,
              private submissionService: SubmissionService) {
  }

  @HostListener('mousewheel', ['$event']) onMousewheel(event) {
    if (event.wheelDelta > 0 && this.scrollableTop) {
      event.preventDefault();
    }
    if (event.wheelDelta < 0 && this.scrollableBottom) {
      event.preventDefault();
    }
  }

  onScroll(event) {
    this.scrollableBottom = (event.target.scrollTop + event.target.clientHeight === event.target.scrollHeight);
    this.scrollableTop = (event.target.scrollTop === 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (hasValue(changes.currentCollectionId)
      && hasValue(changes.currentCollectionId.currentValue)
      && !isNotEmpty(this.listCollection)) {
      this.selectedCollectionId = this.currentCollectionId;
      // @TODO replace with search/top browse endpoint
      // @TODO implement community/subcommunity hierarchy
      this.subs.push(this.communityDataService.findAll()
        .filter((communities: RemoteData<PaginatedList<Community>>) => isNotEmpty(communities.payload))
        .first()
        .switchMap((communities: RemoteData<PaginatedList<Community>>) => communities.payload.page)
        .subscribe((communityData: Community) => {

          this.subs.push(this.collectionDataService.getAuthorizedCollectionByCommunity(communityData.uuid)
            .filter((collections: RemoteData<PaginatedList<Collection>>) => !collections.isResponsePending && collections.hasSucceeded)
            .first()
            .filter((collections: RemoteData<PaginatedList<Collection>>) => collections.payload.totalElements > 0)
            .switchMap((collections: RemoteData<PaginatedList<Collection>>) => collections.payload.page)
            .filter((collectionData: Collection) => isNotEmpty(collectionData))
            .subscribe((collectionData: Collection) => {
              if (collectionData.id === this.selectedCollectionId) {
                this.selectedCollectionName = collectionData.name;
              }
              const collectionEntry = {
                communities: [{id: communityData.id, name: communityData.name}],
                collection: {id: collectionData.id, name: collectionData.name}
              };
              this.listCollection.push(collectionEntry);
              this.searchListCollection.push(collectionEntry);
              this.disabled = false;
              this.cdr.detectChanges();
            }))
        }));
    }
  }

  ngOnInit() {
    this.pathCombiner = new JsonPatchOperationPathCombiner('sections', 'collection');
    this.searchField = new FormControl();
    this.searchField.valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .subscribe((term) => {
        this.search(term);
      });
  }

  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

  search(text: string) {
    if (text === '' || isNullOrUndefined(text)) {
      this.searchListCollection = this.listCollection;
    } else {
      this.searchListCollection = this.listCollection.filter((v) => v.collection.name.toLowerCase().indexOf(text.toLowerCase()) > -1).slice(0, 5);
    }
  }

  onSelect(event) {
    this.searchField.reset();
    this.searchListCollection = this.listCollection;
    this.disabled = true;
    this.operationsBuilder.replace(this.pathCombiner.getPath(), event.collection.id, true);
    this.operationsService.jsonPatchByResourceID(
      this.submissionService.getSubmissionObjectLinkName(),
      this.submissionId,
      'sections',
      'collection')
      .subscribe((submissionObject: SubmissionObject[]) => {
        this.selectedCollectionId = event.collection.id;
        this.selectedCollectionName = event.collection.name;
        this.collectionChange.emit(submissionObject[0]);
        this.submissionService.changeSubmissionCollection(this.submissionId, event.collection.id);
        this.disabled = false;
        this.cdr.detectChanges();
      })
  }

  onClose(event) {
    this.searchField.reset();
  }
}
