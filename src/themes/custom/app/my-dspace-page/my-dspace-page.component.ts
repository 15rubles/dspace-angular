import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MyDSpacePageComponent as BaseComponent, SEARCH_CONFIG_SERVICE } from '../../../../app/my-dspace-page/my-dspace-page.component';
import { MyDSpaceConfigurationService } from '../../../../app/my-dspace-page/my-dspace-configuration.service';
import { pushInOut } from "@dspace/shared/animations";
import { ThemedSearchComponent } from '../../../../app/shared/search/themed-search.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { MyDSpaceNewSubmissionComponent } from '../../../../app/my-dspace-page/my-dspace-new-submission/my-dspace-new-submission.component';
import { RoleDirective } from '../../../../app/shared/roles/role.directive';

/**
 * This component represents the whole mydspace page
 */
@Component({
    selector: 'ds-my-dspace-page',
    // styleUrls: ['./my-dspace-page.component.scss'],
    styleUrls: ['../../../../app/my-dspace-page/my-dspace-page.component.scss'],
    // templateUrl: './my-dspace-page.component.html',
    templateUrl: '../../../../app/my-dspace-page/my-dspace-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [pushInOut],
    providers: [
        {
            provide: SEARCH_CONFIG_SERVICE,
            useClass: MyDSpaceConfigurationService
        }
    ],
    standalone: true,
    imports: [RoleDirective, MyDSpaceNewSubmissionComponent, NgIf, ThemedSearchComponent, AsyncPipe]
})
export class MyDSpacePageComponent extends BaseComponent {
}
