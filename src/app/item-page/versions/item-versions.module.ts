/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ItemVersionsComponent } from './item-versions.component';
import { ItemVersionsNoticeComponent } from './notice/item-versions-notice.component';
import { AlertComponent } from "@dspace/shared/ui";

const DECLARATIONS = [
  ItemVersionsComponent,
  ItemVersionsNoticeComponent,
];

@NgModule({
    imports: [
        SharedModule,
        AlertComponent,
        ...DECLARATIONS
    ],
    exports: [
        ...DECLARATIONS,
    ]
})
export class ItemVersionsModule {

}
