import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { isEqual } from 'lodash';

import { SubmissionState } from '../submission.reducers';
import { hasValue, isEmpty, isNotEmpty, isNotUndefined } from '../../shared/empty.util';
import {
  DisableSectionAction,
  EnableSectionAction,
  InertSectionErrorsAction,
  RemoveSectionErrorsAction,
  SectionStatusChangeAction,
  UpdateSectionDataAction
} from '../objects/submission-objects.actions';
import {
  SubmissionObjectEntry,
  SubmissionSectionError,
  SubmissionSectionObject
} from '../objects/submission-objects.reducer';
import {
  submissionObjectFromIdSelector,
  submissionSectionDataFromIdSelector,
  submissionSectionErrorsFromIdSelector,
  submissionSectionFromIdSelector
} from '../selectors';
import { SubmissionScopeType } from '../../core/submission/submission-scope-type';
import parseSectionErrorPaths, { SectionErrorPath } from '../utils/parseSectionErrorPaths';
import { FormAddError, FormClearErrorsAction, FormRemoveErrorAction } from '../../shared/form/form.actions';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { SubmissionService } from '../submission.service';
import { WorkspaceitemSectionDataType } from '../../core/submission/models/workspaceitem-sections.model';

@Injectable()
export class SectionsService {

  constructor(private notificationsService: NotificationsService,
              private scrollToService: ScrollToService,
              private submissionService: SubmissionService,
              private store: Store<SubmissionState>) {
  }

  public checkSectionErrors(
    submissionId: string,
    sectionId: string,
    formId: string,
    currentErrors: SubmissionSectionError[],
    prevErrors: SubmissionSectionError[] = []) {
    if (isEmpty(currentErrors)) {
      this.store.dispatch(new RemoveSectionErrorsAction(submissionId, sectionId));
      this.store.dispatch(new FormClearErrorsAction(formId));
    } else if (!isEqual(currentErrors, prevErrors)) {
      const dispatchedErrors = [];
      currentErrors.forEach((error: SubmissionSectionError) => {
        const errorPaths: SectionErrorPath[] = parseSectionErrorPaths(error.path);

        errorPaths.forEach((path: SectionErrorPath) => {
          if (path.fieldId) {
            const fieldId = path.fieldId.replace(/\./g, '_');

            // Dispatch action to the form state;
            const formAddErrorAction = new FormAddError(formId, fieldId, path.fieldIndex, error.message);
            this.store.dispatch(formAddErrorAction);
            dispatchedErrors.push(fieldId);
          }
        });
      });

      prevErrors.forEach((error: SubmissionSectionError) => {
        const errorPaths: SectionErrorPath[] = parseSectionErrorPaths(error.path);

        errorPaths.forEach((path: SectionErrorPath) => {
          if (path.fieldId) {
            const fieldId = path.fieldId.replace(/\./g, '_');

            if (!dispatchedErrors.includes(fieldId)) {
              const formRemoveErrorAction = new FormRemoveErrorAction(formId, fieldId, path.fieldIndex);
              this.store.dispatch(formRemoveErrorAction);
            }
          }
        });
      });
    }
  }

  public dispatchRemoveSectionErrors(submissionId, sectionId) {
    this.store.dispatch(new RemoveSectionErrorsAction(submissionId, sectionId));
  }

  public getSectionData(submissionId: string, sectionId: string): Observable<WorkspaceitemSectionDataType> {
    return this.store.select(submissionSectionDataFromIdSelector(submissionId, sectionId))
      .distinctUntilChanged();
  }

  public getSectionErrors(submissionId: string, sectionId: string): Observable<SubmissionSectionError[]> {
    return this.store.select(submissionSectionErrorsFromIdSelector(submissionId, sectionId))
      .distinctUntilChanged();
  }

  public getSectionState(submissionId: string, sectionId: string): Observable<SubmissionSectionObject> {
    return this.store.select(submissionSectionFromIdSelector(submissionId, sectionId))
      .filter((sectionObj: SubmissionSectionObject) => hasValue(sectionObj))
      .map((sectionObj: SubmissionSectionObject) => sectionObj)
      .distinctUntilChanged();
  }

  public isSectionValid(submissionId: string, sectionId: string): Observable<boolean> {
    return this.store.select(submissionSectionFromIdSelector(submissionId, sectionId))
      .filter((sectionObj) => hasValue(sectionObj))
      .map((sectionObj: SubmissionSectionObject) => sectionObj.isValid)
      .distinctUntilChanged();
  }

  public isSectionActive(submissionId: string, sectionId: string): Observable<boolean> {
    return this.submissionService.getActiveSectionId(submissionId)
      .map((activeSectionId: string) => sectionId === activeSectionId)
      .distinctUntilChanged();
  }

  public isSectionEnabled(submissionId: string, sectionId: string): Observable<boolean> {
    return this.store.select(submissionSectionFromIdSelector(submissionId, sectionId))
      .filter((sectionObj) => hasValue(sectionObj))
      .map((sectionObj: SubmissionSectionObject) => sectionObj.enabled)
      .distinctUntilChanged();
  }

  public isSectionReadOnly(submissionId: string, sectionId: string, submissionScope: SubmissionScopeType): Observable<boolean> {
    return this.store.select(submissionSectionFromIdSelector(submissionId, sectionId))
      .filter((sectionObj) => hasValue(sectionObj))
      .map((sectionObj: SubmissionSectionObject) => {
        return sectionObj.visibility.other === 'READONLY' && submissionScope !== SubmissionScopeType.WorkspaceItem
      })
      .distinctUntilChanged();
  }

  public isSectionAvailable(submissionId: string, sectionId: string): Observable<boolean> {
    return this.store.select(submissionObjectFromIdSelector(submissionId))
      .filter((submissionState: SubmissionObjectEntry) => isNotUndefined(submissionState))
      .map((submissionState: SubmissionObjectEntry) => {
        return isNotUndefined(submissionState.sections) && isNotUndefined(submissionState.sections[sectionId]);
      })
      .distinctUntilChanged();
  }

  public addSection(submissionId: string,
                    sectionId: string) {
    this.store.dispatch(new EnableSectionAction(submissionId, sectionId));
    const config: ScrollToConfigOptions = {
      target: sectionId,
      offset: -70
    };

    this.scrollToService.scrollTo(config);
  }

  public removeSection(submissionId: string, sectionId: string) {
    this.store.dispatch(new DisableSectionAction(submissionId, sectionId))
  }

  public updateSectionData(submissionId: string, sectionId: string, data, errors = []) {
    if (isNotEmpty(data)) {
      const isAvailable$ = this.isSectionAvailable(submissionId, sectionId);
      const isEnabled$ = this.isSectionEnabled(submissionId, sectionId);

      Observable.combineLatest(isAvailable$, isEnabled$)
        .take(1)
        .filter(([available, enabled]: [boolean, boolean]) => available)
        .subscribe(([available, enabled]: [boolean, boolean]) => {
          if (!enabled) {
            this.submissionService.notifyNewSection(submissionId, sectionId);
          }
          this.store.dispatch(new UpdateSectionDataAction(submissionId, sectionId, data, errors));
        });
    }
  }

  public setSectionError(submissionId: string, sectionId: string, error: SubmissionSectionError) {
    this.store.dispatch(new InertSectionErrorsAction(submissionId, sectionId, error));
  }

  public setSectionStatus(submissionId: string, sectionId: string, status: boolean) {
    this.store.dispatch(new SectionStatusChangeAction(submissionId, sectionId, status));
  }
}
