import { DynamicFormControlLayout, serializable } from '@ng-dynamic-forms/core';
import { FormRowModel } from '../../../../../../core/shared/config/config-submission-forms.model';
import { DsDynamicInputModel, DsDynamicInputModelConfig } from '../ds-dynamic-input.model';
import { AuthorityValueModel } from '../../../../../../core/integration/models/authority-value.model';
import { isEmpty, isNull } from '../../../../../empty.util';

export const DYNAMIC_FORM_CONTROL_TYPE_RELATION = 'RELATION';
export const PLACEHOLDER_PARENT_METADATA = '#PLACEHOLDER_PARENT_METADATA_VALUE#';

/**
 * Dynamic Group Model configuration interface
 */
export interface DynamicGroupModelConfig extends DsDynamicInputModelConfig {
  formConfiguration: FormRowModel[],
  mandatoryField: string,
  name: string,
  relationFields: string[],
  scopeUUID: string,
  value?: any;
}

/**
 * Dynamic Group Model class
 */
export class DynamicGroupModel extends DsDynamicInputModel {
  @serializable() formConfiguration: FormRowModel[];
  @serializable() mandatoryField: string;
  @serializable() relationFields: string[];
  @serializable() scopeUUID: string;
  @serializable() _value: any[];
  @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_RELATION;

  constructor(config: DynamicGroupModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);

    this.formConfiguration = config.formConfiguration;
    this.mandatoryField = config.mandatoryField;
    this.relationFields = config.relationFields;
    this.scopeUUID = config.scopeUUID;
    const value = config.value || [];
    this.valueUpdates.next(value);
  }

  get value() {
    if (isEmpty(this._value)) {
      // If items is empty, last element has been removed
      // so emit an empty value that allows to dispatch
      // a remove JSON PATCH operation
      const emptyItem = Object.create({});
      emptyItem[this.mandatoryField] = null;
      this.relationFields
        .forEach((field) => {
          emptyItem[field] = null;
        });
      return [emptyItem];
    }
    return this._value
  }

  set value(value) {
    this._value = value;
  }

  isEmpty() {
    return (this.value.length === 1 && isNull(this.value[0][this.mandatoryField]));
  }
}
