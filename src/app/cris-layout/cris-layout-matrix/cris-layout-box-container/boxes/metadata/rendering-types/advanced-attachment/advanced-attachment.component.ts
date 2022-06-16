import { environment } from './../../../../../../../../environments/environment';
import { FeatureID } from './../../../../../../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from './../../../../../../../core/data/feature-authorization/authorization-data.service';
import { Component, Inject, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { BitstreamRenderingModelComponent } from '../bitstream-rendering-model';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { getBitstreamDownloadRoute, getBitstreamRequestACopyRoute } from '../../../../../../../app-routing-paths';


@Component({
  selector: 'ds-advanced-attachment',
  templateUrl: './advanced-attachment.component.html',
  styleUrls: ['./advanced-attachment.component.scss']
})
/**
 * This component renders the attachment with an advanced layout.
 */
@MetadataBoxFieldRendering(FieldRenderingType.ADVANCEDATTACHMENT, true)
export class AdvancedAttachmentComponent extends BitstreamRenderingModelComponent implements OnInit {


  /**
   * List of bitstreams to show in the list
   */
  bitstreams$: Observable<Bitstream[]>;

  /**
   * Envoirment variables configuring the fields to be viewed
   */
  envData = environment.advancedAttachment;

  /**
   * Envoirment variables configuring pagination
   */
  envPagination = environment.attachmentPagination;

  constructor(
    private authorizationService: AuthorizationDataService,
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected bitstreamDataService: BitstreamDataService,
    protected translateService: TranslateService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, bitstreamDataService, translateService);
  }


  /**
  * On init check if we want to show the attachment list with pagination or show all attachments
  */
  ngOnInit() {
    if (this.envPagination.pagination) {
      this.startWithPagination();
      this.getVisibleBitstreams();
    } else {
      this.startWithAll();
    }
  }


  /**
   * Start the list with all the attachments
   */
  startWithAll() {
    this.bitstreams$ = this.getBitstreams();
  }

  /**
   * Get the bitstreams until a specific page
   */
  getVisibleBitstreams() {
    this.bitstreams$ = this.getPaginatedBitstreams();
  }


  /**
   * Get if bitstream can be downloaded
   */
  getCanDownload(bitstream): Observable<boolean> {
    return this.authorizationService.isAuthorized(FeatureID.CanDownload, bitstream.self);
  }


  /**
   * Get if bitstream can be requested as copy
   */
  getCanRequestACopy(bitstream): Observable<boolean> {
    return this.authorizationService.isAuthorized(FeatureID.CanRequestACopy, bitstream.self);
  }


  /**
   * Get the download link
   */
  downloadLink(bitstream: Bitstream) {
    return {
      routerLink: getBitstreamDownloadRoute(bitstream),
      queryParams: {}
    };
  }


  /**
   * Get the request a copy link
   */
  requestACopyLink(bitstream: Bitstream) {
    return getBitstreamRequestACopyRoute(this.item, bitstream);
  }

}
