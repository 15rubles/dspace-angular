import { DsDynamicLookupRelationSearchTabComponent as BaseComponent } from '../../../../../../../../../app/shared/form/builder/ds-dynamic-form-ui/relation-lookup-modal/search-tab/dynamic-lookup-relation-search-tab.component';
import { Component } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../../../../app/my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../../../../app/core/shared/search/search-configuration.service';
import { TranslateModule } from '@ngx-translate/core';
import { VarDirective } from '../../../../../../../../../app/shared/utils/var.directive';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ThemedSearchComponent } from '../../../../../../../../../app/shared/search/themed-search.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'ds-dynamic-lookup-relation-search-tab',
    // styleUrls: ['./dynamic-lookup-relation-search-tab.component.scss'],
    styleUrls: ['../../../../../../../../../app/shared/form/builder/ds-dynamic-form-ui/relation-lookup-modal/search-tab/dynamic-lookup-relation-search-tab.component.scss'],
    // templateUrl: './dynamic-lookup-relation-search-tab.component.html',
    templateUrl: '../../../../../../../../../app/shared/form/builder/ds-dynamic-form-ui/relation-lookup-modal/search-tab/dynamic-lookup-relation-search-tab.component.html',
    providers: [
        {
            provide: SEARCH_CONFIG_SERVICE,
            useClass: SearchConfigurationService
        }
    ],
    standalone: true,
    imports: [NgIf, ThemedSearchComponent, NgbDropdownModule, VarDirective, AsyncPipe, TranslateModule]
})
export class DsDynamicLookupRelationSearchTabComponent extends BaseComponent {

}
