import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CollectionPageComponent as BaseComponent} from '../../../../app/collection-page/collection-page.component';
import { fadeIn, fadeInOut } from "@dspace/shared/animations";
import { TranslateModule } from '@ngx-translate/core';
import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { ErrorComponent } from '../../../../app/shared/error/error.component';
import { ObjectCollectionComponent } from '../../../../app/shared/object-collection/object-collection.component';
import { ThemedComcolPageBrowseByComponent } from '../../../../app/shared/comcol/comcol-page-browse-by/themed-comcol-page-browse-by.component';
import { DsoPageSubscriptionButtonComponent } from '../../../../app/shared/dso-page/dso-page-subscription-button/dso-page-subscription-button.component';
import { DsoEditMenuComponent } from '../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ComcolPageContentComponent } from '../../../../app/shared/comcol/comcol-page-content/comcol-page-content.component';
import { ThemedComcolPageHandleComponent } from '../../../../app/shared/comcol/comcol-page-handle/themed-comcol-page-handle.component';
import { ComcolPageLogoComponent } from '../../../../app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { ComcolPageHeaderComponent } from '../../../../app/shared/comcol/comcol-page-header/comcol-page-header.component';
import { ViewTrackerComponent } from '../../../../app/statistics/angulartics/dspace/view-tracker.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { VarDirective } from '../../../../app/shared/utils/var.directive';


@Component({
    selector: 'ds-collection-page',
    // templateUrl: './collection-page.component.html',
    templateUrl: '../../../../app/collection-page/collection-page.component.html',
    // styleUrls: ['./collection-page.component.scss']
    styleUrls: ['../../../../app/collection-page/collection-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        fadeIn,
        fadeInOut
    ],
    standalone: true,
    imports: [VarDirective, NgIf, ViewTrackerComponent, ComcolPageHeaderComponent, ComcolPageLogoComponent, ThemedComcolPageHandleComponent, ComcolPageContentComponent, DsoEditMenuComponent, DsoPageSubscriptionButtonComponent, ThemedComcolPageBrowseByComponent, ObjectCollectionComponent, ErrorComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule]
})
/**
 * This component represents a detail page for a single collection
 */
export class CollectionPageComponent extends BaseComponent {}
