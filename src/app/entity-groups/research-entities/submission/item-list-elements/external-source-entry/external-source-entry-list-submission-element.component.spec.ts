import { ExternalSourceEntryListSubmissionElementComponent } from './external-source-entry-list-submission-element.component';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExternalSourceEntry } from '../../../../../core/shared/external-source-entry.model';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ExternalSourceEntryListSubmissionElementComponent', () => {
  let component: ExternalSourceEntryListSubmissionElementComponent;
  let fixture: ComponentFixture<ExternalSourceEntryListSubmissionElementComponent>;

  const uri = 'https://orcid.org/0001-0001-0001-0001';
  const entry = Object.assign(new ExternalSourceEntry(), {
    id: '0001-0001-0001-0001',
    display: 'John Doe',
    value: 'John, Doe',
    metadata: {
      'dc.identifier.uri': [
        {
          value: uri,
        },
      ],
      'dc.date.issued': [
        {
          value: '2020-10-06T00:00:00Z',
          language: null,
          authority: null,
          confidence: -1,
          place: -1,
        },
      ],
      'dc.contributor.author': [
        {
          value: 'Oktyabrsky, Oleg N',
          language: null,
          authority: null,
          confidence: -1,
          place: -1,
        },
      ],
      'dc.description.abstract': [
        {
          value:
            'Activities of plant polyphenols (PPs), resveratrol and quercetin, alone or in combination with four conventional antibiotics against ' +
            'Escherichia coli have been investigated. In medium without antibiotics, both polyphenols caused a dose-dependent growth inhibition. ' +
            'However, pretreatment with resveratrol (40 and 100 μg ml) and quercetin (40 μg ml) reduced the bacteriostatic effect of kanamycin, ' +
            ', cefotaxime and partially of ciprofloxacin. With few exceptions, both PPs also reduced the bactericidal effect of tested antibiotics.' +
            ' Paradoxically, low doses of PPs enhanced the bactericidal effect of kanamycin and partially ciprofloxacin. Compared to quercetin, resveratrol' +
            ' showed a weaker effect on the induction of antioxidant genes and the resistance of E. coli to the oxidative stress generated by ' +
            'hydrogen peroxide treatment. Both polyphenols at high doses reduced membrane potential. Altogether, these findings suggest that the ' +
            'decrease in the bactericidal effect of antibiotics by high doses of polyphenols is mostly due to bacteriostatic action of the latter. ' +
            'In the case of quercetin, the contribution of its antioxidant activity for antibiotic protection may be significant. ' +
            'There is a growing interest in the use of plant-derived compounds to enhance the toxicity of traditional antibiotics.' +
            ' This and other studies show that, under certain conditions, the use of polyphenols as adjuvants may not exert the expected' +
            ' therapeutic effect, but rather to decrease antimicrobial activity of antibiotics.',
          language: null,
          authority: null,
          confidence: -1,
          place: -1,
        },
      ],
      'dc.identifier.doi': [
        {
          value: '10.1007/s11274-020-02934-y',
          language: null,
          authority: null,
          confidence: -1,
          place: -1,
        },
      ],
      'dc.identifier.pmid': [
        {
          value: '33025172',
          language: null,
          authority: null,
          confidence: -1,
          place: -1,
        },
      ],
    },
    matchObjects: [
      {
        id: '7fd133e7-feaa-4be9-a1d2-5258694556ae',
        uuid: '7fd133e7-feaa-4be9-a1d2-5258694556ae',
        name: 'Public item',
        handle: '123456789/4',
        metadata: {
          'crisrp.name': [
            {
              value: 'Public item',
              language: null,
              authority: null,
              confidence: -1,
              place: 0,
            },
          ],
        },
        inArchive: true,
        discoverable: true,
        withdrawn: false,
        lastModified: '2023-10-20T09:23:12.984+00:00',
        entityType: 'Publication',
        type: 'item',
      },
    ],
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalSourceEntryListSubmissionElementComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalSourceEntryListSubmissionElementComponent);
    component = fixture.componentInstance;
    component.object = entry;
    fixture.detectChanges();
  });

  it('should display the entry\'s display value', () => {
    expect(fixture.nativeElement.textContent).toContain(entry.display);
  });

  it('should display the entry\'s uri', () => {
    expect(fixture.nativeElement.textContent).toContain(uri);
  });

  it('should display the entry\'s issued', () => {
    expect(fixture.debugElement.query(By.css('[data-test="issued"]'))).toBeTruthy();
  });

  it('should display the entry\'s contributors', () => {
    expect(fixture.debugElement.query(By.css('[data-test="contributors"]'))).toBeTruthy();
  });

  it('should display the entry\'s abstract', () => {
    expect(fixture.debugElement.query(By.css('[data-test="abstract"]'))).toBeTruthy();
  });

  it('should display the entry\'s identifiers', () => {
    expect(fixture.debugElement.query(By.css('[data-test="identifiers"]'))).toBeTruthy();
  });

  it('should display the entry\'s duplicate match titles when matchObjects has items', () => {
    const matchElements = fixture.nativeElement.querySelectorAll('[data-test="matchObjectsLink"]');
    expect(matchElements[0].textContent.trim()).toEqual('Public item (7fd133e7-feaa-4be9-a1d2-5258694556ae)');
  });
});
