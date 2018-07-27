import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { WorkspaceitemSectionsObject } from '../../core/submission/models/workspaceitem-sections.model';
import { hasValue, isEmpty, isNotNull } from '../../shared/empty.util';
import { SubmissionDefinitionsModel } from '../../core/shared/config/config-submission-definitions.model';
import { SubmissionService } from '../submission.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { SubmissionObject } from '../../core/submission/models/submission-object.model';

@Component({
  selector: 'ds-submission-edit',
  styleUrls: ['./submission-edit.component.scss'],
  templateUrl: './submission-edit.component.html'
})

export class SubmissionEditComponent implements OnDestroy, OnInit {
  public collectionId: string;
  public sections: WorkspaceitemSectionsObject;
  public selfUrl: string;
  public submissionDefinition: SubmissionDefinitionsModel;
  public submissionId: string;
  public taskId: string;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  private subs: Subscription[] = [];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              private router: Router,
              private submissionService: SubmissionService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.subs.push(this.route.paramMap
      .subscribe((params: ParamMap) => {
        this.submissionId = params.get('id');
        this.taskId = params.get('taskid');
        this.subs.push(
          this.submissionService.retrieveSubmission(this.submissionId)
            .subscribe((submissionObject: SubmissionObject) => {
              // NOTE new submission is retrieved on the browser side only
              if (isNotNull(submissionObject)) {
                if (isEmpty(submissionObject)) {
                  this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
                  this.router.navigate(['/mydspace']);
                } else {
                  this.collectionId = submissionObject.collection[0].id;
                  this.selfUrl = submissionObject.self;
                  this.sections = submissionObject.sections;
                  this.submissionDefinition = submissionObject.submissionDefinition[0];
                  this.changeDetectorRef.detectChanges();
                }
              }
            })
        )
      }));
  }

  /**
   * Method provided by Angular. Invoked when the instance is destroyed.
   */
  ngOnDestroy() {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }
}
