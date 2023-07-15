import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { AbstractSimpleItemActionComponent } from '../simple-item-action/abstract-simple-item-action.component';
import { RemoteData } from '../../../core/data/remote-data';
import { Item } from '../../../core/shared/item.model';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { ItemDataService } from '../../../core/data/item-data.service';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { ModifyItemOverviewComponent } from '../modify-item-overview/modify-item-overview.component';

@Component({
    selector: 'ds-item-reinstate',
    templateUrl: '../simple-item-action/abstract-simple-item-action.component.html',
    standalone: true,
    imports: [ModifyItemOverviewComponent, RouterLink, TranslateModule]
})
/**
 * Component responsible for rendering the Item Reinstate page
 */
export class ItemReinstateComponent extends AbstractSimpleItemActionComponent {

  protected messageKey = 'reinstate';
  protected predicate = (rd: RemoteData<Item>) => !rd.payload.isWithdrawn;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected itemDataService: ItemDataService,
              protected translateService: TranslateService) {
    super(route, router, notificationsService, itemDataService, translateService);
  }

  /**
   * Perform the reinstate action to the item
   */
  performAction() {
    this.itemDataService.setWithDrawn(this.item, false).pipe(getFirstCompletedRemoteData()).subscribe(
      (response: RemoteData<Item>) => {
        this.processRestResponse(response);
      }
    );
  }
}
