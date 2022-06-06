import { Component, Input, OnInit } from '@angular/core';
import { HealthResponse } from '../models/health-component.model';
import { TranslateService } from '@ngx-translate/core';
import {isNotEmpty} from '../../shared/empty.util';

@Component({
  selector: 'ds-health-panel',
  templateUrl: './health-panel.component.html',
  styleUrls: ['./health-panel.component.scss']
})
export class HealthPanelComponent implements OnInit {

  /**
   * Health endpoint response
   */
  @Input() healthResponse: HealthResponse;

  /**
   * The first active panel id
   */
  activeId: string;

  constructor(private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.activeId = Object.keys(this.healthResponse.components)[0];
  }

  /**
   * Return translated label if exist for the given property
   *
   * @param panelKey
   */
  public getPanelLabel(panelKey: string): string {
    const translationKey = `health-page.section.${panelKey}.title`;
    const translation = this.translate.instant(translationKey);

    return (translation === translationKey) ? panelKey : translation;
  }

  /**
   * Check if the current entry has data to be shown
   * @param entryValue
   */
  showEntryData(entryValue) {
    return isNotEmpty(entryValue?.components) || isNotEmpty(entryValue?.details);
  }
}
