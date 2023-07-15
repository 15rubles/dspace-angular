import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CurationFormComponent } from '../../curation-form/curation-form.component';

/**
 * Component responsible for rendering the system wide Curation Task UI
 */
@Component({
    selector: 'ds-admin-curation-task',
    templateUrl: './admin-curation-tasks.component.html',
    standalone: true,
    imports: [CurationFormComponent, TranslateModule]
})
export class AdminCurationTasksComponent {

}
