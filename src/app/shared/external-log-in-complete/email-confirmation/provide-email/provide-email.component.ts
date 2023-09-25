import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EpersonRegistrationService } from '../../../../core/data/eperson-registration.service';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';

@Component({
  selector: 'ds-provide-email',
  templateUrl: './provide-email.component.html',
  styleUrls: ['./provide-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProvideEmailComponent {
  emailForm: FormGroup;

  @Input() registrationId: string;

  @Input() token: string;

  constructor(
    private formBuilder: FormBuilder,
    private epersonRegistrationService: EpersonRegistrationService
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submitForm() {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.valid) {
      const email = this.emailForm.get('email').value;
      console.log('Email submitted:', email);
      this.epersonRegistrationService
        .patchUpdateRegistration(
          email,
          'email',
          this.registrationId,
          this.token,
          true
        )
        .pipe(getFirstCompletedRemoteData())
        .subscribe((update) => {
          console.log('Email update:', update);
        });
    }
  }
}
