import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

import { FormSectionComponent } from './section/form/section-form.component';
import { SectionDirective } from './section/section.directive';
import { SectionService } from './section/section.service';
import { DefaultSectionComponent } from './section/default/section-default.component';
import { SubmissionFormCollectionComponent } from './form/collection/submission-form-collection.component';
import { SubmissionFormFooterComponent } from './form/footer/submission-form-footer.component';
import { SubmissionFormComponent } from './form/submission-form.component';
import { SubmissionFormSectionAddComponent } from './form/section-add/submission-form-section-add.component';
import { SectionContainerComponent } from './section/container/section-container.component';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { submissionReducers } from './submission.reducers';
import { submissionEffects } from './submission.effects';
import { FilesSectionComponent } from './section/upload/section-upload.component';
import { SectionUploadService } from './section/upload/section-upload.service';
import { SubmissionUploadFilesComponent } from './form/submission-upload-files/submission-upload-files.component';
import { SubmissionRestService } from './submission-rest.service';
import { LicenseSectionComponent } from './section/license/section-license.component';
import { SubmissionUploadsConfigService } from '../core/config/submission-uploads-config.service';
import { SubmissionEditComponent } from './edit/submission-edit.component';
import { UploadSectionFileComponent } from './section/upload/file/file.component';
import { UploadSectionFileEditComponent } from './section/upload/file/edit/file-edit.component';
import { UploadSectionFileViewComponent } from './section/upload/file/view/file-view.component';
import { AccessConditionsComponent } from './section/upload/accessConditions/accessConditions.component';
import { RecycleSectionComponent } from './section/recycle/section-recycle.component';
import { DeduplicationSectionComponent } from './section/deduplication/section-deduplication.component';
import { DeduplicationMatchComponent } from './section/deduplication/match/deduplication-match.component';
import { DeduplicationService } from './section/deduplication/deduplication.service';
import { SubmissionSubmitComponent } from './submit/submission-submit.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    StoreModule.forFeature('submission', submissionReducers, {}),
    EffectsModule.forFeature(submissionEffects),
    TranslateModule
  ],
  declarations: [
    AccessConditionsComponent,
    DefaultSectionComponent,
    FilesSectionComponent,
    FormSectionComponent,
    LicenseSectionComponent,
    SectionDirective,
    SectionContainerComponent,
    SubmissionEditComponent,
    SubmissionFormSectionAddComponent,
    SubmissionFormCollectionComponent,
    SubmissionFormComponent,
    SubmissionFormFooterComponent,
    SubmissionSubmitComponent,
    SubmissionUploadFilesComponent,
    UploadSectionFileComponent,
    UploadSectionFileEditComponent,
    UploadSectionFileViewComponent,
    RecycleSectionComponent,
    DeduplicationSectionComponent,
    DeduplicationMatchComponent,
  ],
  entryComponents: [
    DefaultSectionComponent,
    FilesSectionComponent,
    FormSectionComponent,
    LicenseSectionComponent,
    SectionContainerComponent,
    RecycleSectionComponent,
    DeduplicationSectionComponent],
  exports: [
    SubmissionEditComponent,
    SubmissionFormComponent,
    SubmissionSubmitComponent
  ],
  providers: [
    SectionUploadService,
    SectionService,
    SubmissionRestService,
    SubmissionUploadsConfigService,
    DeduplicationService
  ]
})
export class SubmissionModule {
}
