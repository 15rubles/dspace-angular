import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { MyDspacePageRoutingModule } from './my-dspace-page-routing.module';
import { MyDSpacePageComponent } from './my-dspace-page.component';
import { SearchPageModule } from '../+search-page/search-page.module';
import { MyDSpaceResultsComponent } from './my-dspace-results/my-dspace-results.component';
import { WorkspaceitemMyDSpaceResultListElementComponent } from '../shared/object-list/my-dspace-result-list-element/wsi-my-dspace-result/wsi-my-dspace-result-list-element.component';
import { ItemMyDSpaceResultListElementComponent } from '../shared/object-list/my-dspace-result-list-element/item-my-dspace-result/item-my-dspace-result-list-element.component';
import { WorkflowitemMyDSpaceResultListElementComponent } from '../shared/object-list/my-dspace-result-list-element/wfi-my-dspace-result/wfi-my-dspace-result-list-element.component';
import { ClaimedTaskMyDSpaceResultListElementComponent } from '../shared/object-list/my-dspace-result-list-element/ct-my-dspace-result/ct-my-dspace-result-list-element.component';
import { PoolTaskMyDSpaceResultListElementComponent } from '../shared/object-list/my-dspace-result-list-element/pt-my-dspace-result/pt-my-dspace-result-list-element.component';
import { MyDSpaceNewSubmissionComponent } from './my-dspace-new-submission/my-dspace-new-submission.component';
import { ItemMyDSpaceResultDetailElementComponent } from '../shared/object-detail/my-dspace-result-detail-element/item-my-dspace-result/item-my-dspace-result-detail-element.component';
import { WorkspaceitemMyDSpaceResultDetailElementComponent } from '../shared/object-detail/my-dspace-result-detail-element/wsi-my-dspace-result/wsi-my-dspace-result-detail-element.component';
import { WorkspaceitemRejectedMyDSpaceResultListElementComponent } from '../shared/object-list/my-dspace-result-list-element/wsi-rejected-my-dspace-result/wsi-rejected-my-dspace-result-list-element.component';
import { WorkflowitemMyDSpaceResultDetailElementComponent } from '../shared/object-detail/my-dspace-result-detail-element/wfi-my-dspace-result/wfi-my-dspace-result-detail-element.component';
import { ClaimedTaskMyDSpaceResultDetailElementComponent } from '../shared/object-detail/my-dspace-result-detail-element/ct-my-dspace-result/ct-my-dspace-result-detail-element.component';
import { PoolTaskMyDSpaceResultDetailElementComponent } from '../shared/object-detail/my-dspace-result-detail-element/pt-my-dspace-result/pt-my-dspace-result-detail-lement.component';
import { MyDSpaceGuard } from './mydspace.guard';
import { WorkspaceitemRejectedMyDSpaceResultDetailElementComponent } from '../shared/object-detail/my-dspace-result-detail-element/wsi-rejected-my-dspace-result/wsi-rejected-my-dspace-result-list-element.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyDspacePageRoutingModule,
    SearchPageModule
  ],
  declarations: [
    MyDSpacePageComponent,
    MyDSpaceResultsComponent,
    ItemMyDSpaceResultListElementComponent,
    WorkspaceitemMyDSpaceResultListElementComponent,
    WorkspaceitemRejectedMyDSpaceResultListElementComponent,
    WorkflowitemMyDSpaceResultListElementComponent,
    ClaimedTaskMyDSpaceResultListElementComponent,
    PoolTaskMyDSpaceResultListElementComponent,
    ItemMyDSpaceResultDetailElementComponent,
    WorkspaceitemMyDSpaceResultDetailElementComponent,
    WorkspaceitemRejectedMyDSpaceResultDetailElementComponent,
    WorkflowitemMyDSpaceResultDetailElementComponent,
    ClaimedTaskMyDSpaceResultDetailElementComponent,
    PoolTaskMyDSpaceResultDetailElementComponent,
    MyDSpaceNewSubmissionComponent
  ],
  providers: [
    MyDSpaceGuard
  ],
  entryComponents: [
    ItemMyDSpaceResultListElementComponent,
    WorkspaceitemMyDSpaceResultListElementComponent,
    WorkspaceitemRejectedMyDSpaceResultListElementComponent,
    WorkflowitemMyDSpaceResultListElementComponent,
    ClaimedTaskMyDSpaceResultListElementComponent,
    PoolTaskMyDSpaceResultListElementComponent,
    ItemMyDSpaceResultDetailElementComponent,
    WorkspaceitemMyDSpaceResultDetailElementComponent,
    WorkspaceitemRejectedMyDSpaceResultDetailElementComponent,
    WorkflowitemMyDSpaceResultDetailElementComponent,
    ClaimedTaskMyDSpaceResultDetailElementComponent,
    PoolTaskMyDSpaceResultDetailElementComponent
  ]
})
export class MyDSpacePageModule {

}
