import { ChangeDetectorRef, Component, Inject, OnChanges, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {SectionModelComponent} from '../section.model';
import { hasValue, isNotEmpty, isNotUndefined, isUndefined } from '../../../shared/empty.util';
import {SectionUploadService} from './section-upload.service';
import {SectionStatusChangeAction} from '../../objects/submission-objects.actions';
import {SubmissionState} from '../../submission.reducers';
import {CollectionDataService} from '../../../core/data/collection-data.service';
import {GroupEpersonService} from '../../../core/eperson/group-eperson.service';
import {SubmissionUploadsConfigService} from '../../../core/config/submission-uploads-config.service';
import {SubmissionUploadsModel} from '../../../core/shared/config/config-submission-uploads.model';
import { Observable } from 'rxjs/Observable';
import { Group } from '../../../core/eperson/models/group.model';
import { EpersonData } from '../../../core/eperson/eperson-data';
import { SubmissionFormsModel } from '../../../core/shared/config/config-submission-forms.model';
import { SectionType } from '../section-type';
import { renderSectionFor } from '../section-decorator';
import { SectionDataObject } from '../section-data.model';
import { submissionObjectFromIdSelector } from '../../selectors';
import { SubmissionObjectEntry } from '../../objects/submission-objects.reducer';
import { AlertType } from '../../../shared/alerts/aletrs-type';

export const POLICY_DEFAULT_NO_LIST = 1; // Banner1
export const POLICY_DEFAULT_WITH_LIST = 2; // Banner2

@Component({
  selector: 'ds-submission-section-files',
  styleUrls: ['./section-upload.component.scss'],
  templateUrl: './section-upload.component.html',
})
@renderSectionFor(SectionType.Upload)
export class FilesSectionComponent extends SectionModelComponent implements OnInit {

  public AlertTypeEnum = AlertType;
  public fileIndexes = [];
  public fileList = [];
  public fileNames = [];

  public collectionName: string;

  /*
   * Default access conditions of this collection
   */
  public collectionDefaultAccessConditions: any[] = [];

  /*
   * The collection access conditions policy
   */
  public collectionPolicyType;

  public configMetadataForm: SubmissionFormsModel;

  /*
   * List of available access conditions that could be setted to files
   */
  public availableAccessConditionOptions: any[];  // List of accessConditions that an user can select

  /*
   * List of Groups available for every access condition
   */
  protected availableGroups: Map<string, any>; // Groups for any policy

  protected subs = [];

  constructor(private bitstreamService: SectionUploadService,
              private changeDetectorRef: ChangeDetectorRef,
              private collectionDataService: CollectionDataService,
              private store:Store<SubmissionState>,
              private uploadsConfigService: SubmissionUploadsConfigService,
              private groupService: GroupEpersonService,
              @Inject('sectionDataProvider') public injectedSectionData: SectionDataObject,
              @Inject('submissionIdProvider') public injectedSubmissionId: string) {
    super(undefined, injectedSectionData, injectedSubmissionId);
  }

  ngOnInit() {
    this.subs.push(
      this.store.select(submissionObjectFromIdSelector(this.submissionId))
        .filter((submissionObject: SubmissionObjectEntry) => isNotUndefined(submissionObject) && !submissionObject.isLoading)
        .filter((submissionObject: SubmissionObjectEntry) => isUndefined(this.collectionId) || this.collectionId !== submissionObject.collection)
        .subscribe((submissionObject: SubmissionObjectEntry) => {
          this.collectionId = submissionObject.collection;
          this.collectionDataService.findById(this.collectionId)
            .filter((collectionData) => isNotUndefined((collectionData.payload)))
            .take(1)
            .subscribe((collectionData) => {
              this.collectionName = collectionData.payload.name;

              // Default Access Conditions
              this.subs.push(collectionData.payload.defaultAccessConditions
                .filter((accessConditions) => isNotUndefined((accessConditions.payload)))
                .take(1)
                .subscribe((defaultAccessConditions) => {

                  if (isNotEmpty(defaultAccessConditions.payload)) {
                    this.collectionDefaultAccessConditions = Array.isArray(defaultAccessConditions.payload)
                      ? defaultAccessConditions.payload : [defaultAccessConditions.payload];
                  }

                  // Edit Form Configuration, access policy list
                  this.subs.push(this.uploadsConfigService.getConfigByHref(this.sectionData.config)
                    .flatMap((config) => config.payload)
                    .take(1)
                    .subscribe((config: SubmissionUploadsModel) => {
                      this.availableAccessConditionOptions = isNotEmpty(config.accessConditionOptions) ? config.accessConditionOptions : [];

                      this.configMetadataForm = config.metadata[0];
                      this.collectionPolicyType = this.availableAccessConditionOptions.length > 0
                        ? POLICY_DEFAULT_WITH_LIST
                        : POLICY_DEFAULT_NO_LIST;

                      this.availableGroups = new Map();
                      const groupsObs = [];
                      // Retrieve Groups for accessConditionPolicies
                      this.availableAccessConditionOptions.forEach((accessCondition) => {
                        if (accessCondition.hasEndDate === true || accessCondition.hasStartDate === true) {
                          groupsObs.push(this.groupService.getDataByUuid(accessCondition.groupUUID)
                          );
                        }
                      });
                      let obsCounter = 1;
                      Observable.merge(groupsObs)
                        .flatMap((group) => group)
                        .take(groupsObs.length)
                        .subscribe((data: EpersonData) => {
                          const group = data.payload[0] as Group;
                          if (isUndefined(this.availableGroups.get(group.uuid))) {
                            if (Array.isArray(group.groups)) {
                              const groupArrayData = [];
                              for (const groupData of group.groups) {
                                groupArrayData.push({name: groupData.name, uuid: groupData.uuid});
                              }
                              this.availableGroups.set(group.uuid, groupArrayData);
                            } else {
                              this.availableGroups.set(group.uuid, {name: group.name, uuid: group.uuid});
                            }
                          }
                          if (obsCounter++ === groupsObs.length) {
                            this.changeDetectorRef.detectChanges();
                          }
                        })
                    })
                  );
                })
              );
            })
        })
      ,
      this.bitstreamService
        .getUploadedFileList(this.submissionId, this.sectionData.id)
        .filter((bitstreamList) => isNotUndefined(bitstreamList))
        .distinctUntilChanged()
        .subscribe((fileList) => {
            let sectionStatus = false;
            this.fileList = [];
            this.fileIndexes = [];
            this.fileNames = [];
            if (isNotUndefined(fileList) && Object.keys(fileList).length > 0) {
              Object.keys(fileList)
                .forEach((key) => {
                  this.fileList.push(fileList[key]);
                  this.fileIndexes.push(fileList[key].uuid);
                  const fileName = fileList[key].metadata['dc.title'][0].display || fileList[key].uuid;
                  this.fileNames.push(fileName);
                });
              sectionStatus = true;
            }
            this.store.dispatch(new SectionStatusChangeAction(this.submissionId,
              this.sectionData.id,
              sectionStatus));
            this.changeDetectorRef.detectChanges();
          }
        )
    );
  }

  /**
   * Method provided by Angular. Invoked when the instance is destroyed.
   */
  ngOnDestroy() {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }

}
