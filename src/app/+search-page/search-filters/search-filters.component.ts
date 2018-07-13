import { Component, Input } from '@angular/core';
import { SearchService } from '../search-service/search.service';
import { RemoteData } from '../../core/data/remote-data';
import { SearchFilterConfig } from '../search-service/search-filter-config.model';
import { Observable } from 'rxjs/Observable';
import { SearchFilterService } from './search-filter/search-filter.service';
import { SearchConfigOption } from './search-switch-config/search-config-option.model';

/**
 * This component renders a simple item page.
 * The route parameter 'id' is used to request the item it represents.
 * All fields of the item that should be displayed, are defined in its template.
 */

@Component({
  selector: 'ds-search-filters',
  styleUrls: ['./search-filters.component.scss'],
  templateUrl: './search-filters.component.html',
})

export class SearchFiltersComponent {
  @Input() configurationList: SearchConfigOption[];
  @Input() defaultOptions: any;

  filters: Observable<RemoteData<SearchFilterConfig[]>>;
  clearParams;

  constructor(private searchService: SearchService, private filterService: SearchFilterService) {
  }

  ngOnInit(): void {
    this.filters = this.filterService.getSearchOptions(this.defaultOptions)
      .distinctUntilChanged()
      .flatMap((options) => this.searchService.getConfig(options.scope, options.configuration));

    this.clearParams = this.filterService.getCurrentFilters().map((filters) => {
      Object.keys(filters).forEach((f) => filters[f] = null);
      return filters;
    });
  }

  getSearchLink() {
    return this.searchService.getSearchLink();
  }

}
