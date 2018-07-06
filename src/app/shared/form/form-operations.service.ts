import { Injectable } from '@angular/core';

import { isEqual, isObject } from 'lodash';
import {
  DYNAMIC_FORM_CONTROL_TYPE_ARRAY,
  DYNAMIC_FORM_CONTROL_TYPE_GROUP,
  DynamicFormArrayGroupModel,
  DynamicFormControlEvent,
  DynamicFormControlModel
} from '@ng-dynamic-forms/core';

import { isEmpty, isNotEmpty, isNotNull, isNotUndefined, isNull, isUndefined } from '../empty.util';
import { JsonPatchOperationPathCombiner } from '../../core/json-patch/builder/json-patch-operation-path-combiner';
import { FormFieldPreviousValueObject } from './builder/models/form-field-previous-value-object';
import { JsonPatchOperationsBuilder } from '../../core/json-patch/builder/json-patch-operations-builder';
import { FormFieldLanguageValueObject } from './builder/models/form-field-language-value.model';
import { DsDynamicInputModel } from './builder/ds-dynamic-form-ui/models/ds-dynamic-input.model';
import { AuthorityValueModel } from '../../core/integration/models/authority-value.model';
import { FormBuilderService } from './builder/form-builder.service';
import { FormFieldMetadataValueObject } from './builder/models/form-field-metadata-value.model';
import { DynamicQualdropModel } from './builder/ds-dynamic-form-ui/models/ds-dynamic-qualdrop.model';

@Injectable()
export class FormOperationsService {

  constructor(private formBuilder: FormBuilderService, private operationsBuilder: JsonPatchOperationsBuilder) {
  }

  protected dispatchOperationsFromRemoveEvent(pathCombiner: JsonPatchOperationPathCombiner,
                                              event: DynamicFormControlEvent,
                                              previousValue: FormFieldPreviousValueObject) {
    const path = this.getFieldPathFromChangeEvent(event);
    const value = this.getFieldValueFromChangeEvent(event);
    if (this.formBuilder.isQualdropGroup(event.model.parent as DynamicFormControlModel)) {
      this.dispatchOperationsFromMap(this.getComboboxMap(event), pathCombiner, event, previousValue);
    } else if (isNotEmpty(value)) {
      this.operationsBuilder.remove(pathCombiner.getPath(path));
    }
  }

  protected dispatchOperationsFromChangeEvent(pathCombiner: JsonPatchOperationPathCombiner,
                                              event: DynamicFormControlEvent,
                                              previousValue: FormFieldPreviousValueObject,
                                              hasStoredValue: boolean) {
    const path = this.getFieldPathFromChangeEvent(event);
    const segmentedPath = this.getFieldPathSegmentedFromChangeEvent(event);
    const value = this.getFieldValueFromChangeEvent(event);
    // Detect which operation must be dispatched
    if (this.formBuilder.isQualdropGroup(event.model.parent as DynamicFormControlModel)) {
      // It's a qualdrup model
      this.dispatchOperationsFromMap(this.getComboboxMap(event), pathCombiner, event, previousValue);
    } else if (this.formBuilder.isRelationGroup(event.model)) {
      // It's a relation model
      this.dispatchOperationsFromMap(this.getValueMap(value), pathCombiner, event, previousValue);
    } else if (this.formBuilder.hasArrayGroupValue(event.model)) {
      // Model has as value an array, so dispatch an add operation with entire block of values
      this.operationsBuilder.add(
        pathCombiner.getPath(segmentedPath),
        value, true);
    } else if (previousValue.isPathEqual(this.formBuilder.getPath(event.model)) || hasStoredValue) {
      // Here model has a previous value changed or stored in the server
      if (!value.hasValue()) {
        // New value is empty, so dispatch a remove operation
        if (this.getArrayIndexFromEvent(event) === 0) {
          this.operationsBuilder.remove(pathCombiner.getPath(segmentedPath));
        } else {
          this.operationsBuilder.remove(pathCombiner.getPath(path));
        }
      } else {
        // New value is not equal from the previous one, so dispatch a replace operation
        this.operationsBuilder.replace(
          pathCombiner.getPath(path),
          value);
      }
      previousValue.delete();
    } else if (value.hasValue()) {
      // Here model has no previous value but a new one
      if (isUndefined(this.getArrayIndexFromEvent(event))
        || this.getArrayIndexFromEvent(event) === 0) {
        // Model is single field or is part of an array model but is the first item,
        // so dispatch an add operation that initialize the values of a specific metadata
        this.operationsBuilder.add(
          pathCombiner.getPath(segmentedPath),
          value, true);
      } else {
        // Model is part of an array model but is not the first item,
        // so dispatch an add operation that add a value to an existent metadata
        this.operationsBuilder.add(
          pathCombiner.getPath(path),
          value);
      }
    }
  }

  dispatchOperationsFromEvent(pathCombiner: JsonPatchOperationPathCombiner,
                              event: DynamicFormControlEvent,
                              previousValue: FormFieldPreviousValueObject,
                              hasStoredValue: boolean) {
    switch (event.type) {
      case 'remove':
        this.dispatchOperationsFromRemoveEvent(pathCombiner, event, previousValue);
        break;
      case 'change':
        this.dispatchOperationsFromChangeEvent(pathCombiner, event, previousValue, hasStoredValue);
        break;
      default:
        break;
    }
  }

  protected dispatchOperationsFromMap(valueMap: Map<string, any>,
                                      pathCombiner: JsonPatchOperationPathCombiner,
                                      event: DynamicFormControlEvent,
                                      previousValue: FormFieldPreviousValueObject) {
    const currentValueMap = valueMap;
    if (previousValue.isPathEqual(this.formBuilder.getPath(event.model))) {
      previousValue.value.forEach((entry, index) => {
        const currentValue = currentValueMap.get(index);
        if (currentValue) {
          if (!isEqual(entry, currentValue)) {
            this.operationsBuilder.add(pathCombiner.getPath(index), currentValue, true);
          }
          currentValueMap.delete(index);
        } else if (!currentValue) {
          this.operationsBuilder.remove(pathCombiner.getPath(index));
        }
      });
    }
    currentValueMap.forEach((entry: any[], index) => {
      if (entry.length === 1 && isNull(entry[0])) {
        // The last item of the group has been deleted so make a remove op
        this.operationsBuilder.remove(pathCombiner.getPath(index));
      } else {
        this.operationsBuilder.add(pathCombiner.getPath(index), entry, true);
      }
    });

    previousValue.delete();
  }

  getArrayIndexFromEvent(event: DynamicFormControlEvent) {
    let fieldIndex: number;
    if (isNotEmpty(event)) {
      if (isNull(event.context)) {
        if (isNotNull(event.model.parent)) {
          if ((event.model.parent as any).type === DYNAMIC_FORM_CONTROL_TYPE_GROUP) {
            if ((event.model.parent as any).parent) {
              if ((event.model.parent as any).parent.context) {
                if ((event.model.parent as any).parent.context.type === DYNAMIC_FORM_CONTROL_TYPE_ARRAY) {
                  fieldIndex = (event.model.parent as any).parent.index;
                }
              }
            }
          }
        }
      } else {
        fieldIndex = event.context.index;
      }
    }
    return isNotUndefined(fieldIndex) ? fieldIndex : 0;
  }

  public getComboboxMap(event): Map<string, any> {
    const metadataValueMap = new Map();

    (event.model.parent.parent as DynamicFormArrayGroupModel).context.groups.forEach((arrayModel: DynamicFormArrayGroupModel) => {
      const groupModel = arrayModel.group[0] as DynamicQualdropModel;
      const metadataValueList = metadataValueMap.get(groupModel.qualdropId) ? metadataValueMap.get(groupModel.qualdropId) : [];
      if (groupModel.value) {
        metadataValueList.push(groupModel.value);
        metadataValueMap.set(groupModel.qualdropId, metadataValueList);
      }
    });

    return metadataValueMap;
  }

  public getFieldPathFromChangeEvent(event: DynamicFormControlEvent) {
    const fieldIndex = this.getArrayIndexFromEvent(event);
    const fieldId = this.getFieldPathSegmentedFromChangeEvent(event);
    return (isNotUndefined(fieldIndex)) ? fieldId + '/' + fieldIndex : fieldId;
  }

  public getFieldPathSegmentedFromChangeEvent(event: DynamicFormControlEvent) {
    let fieldId;
    if (this.formBuilder.isQualdropGroup(event.model.parent as DynamicFormControlModel)) {
      fieldId = (event.model.parent as any).qualdropId;
    } else {
      fieldId = this.formBuilder.getId(event.model);
    }
    return fieldId;
  }

  public getFieldValueFromChangeEvent(event: DynamicFormControlEvent) {
    let fieldValue;
    const value = (event.model as any).value;

    if (this.formBuilder.isModelInCustomGroup(event.model)) {
      fieldValue = (event.model.parent as any).value;
    } else if ((event.model as any).hasLanguages) {
      const language = (event.model as any).language;
      if ((event.model as DsDynamicInputModel).hasAuthority) {
        if (Array.isArray(value)) {
          value.forEach((authority, index) => {
            authority = Object.assign(new AuthorityValueModel(), authority, {language});
            value[index] = authority;
          });
          fieldValue = value;
        } else {
          fieldValue = Object.assign(new AuthorityValueModel(), value, {language});
        }
      } else {
        // Language without Authority (input, textArea)
        fieldValue = new FormFieldMetadataValueObject(value, language);
      }
    } else if (value instanceof FormFieldLanguageValueObject || value instanceof AuthorityValueModel || isObject(value)) {
      fieldValue = value;
    } else {
      fieldValue = new FormFieldMetadataValueObject(value);
    }

    return fieldValue;
  }

  public getValueMap(items: any[]): Map<string, any> {
    const metadataValueMap = new Map();

    items.forEach((item) => {
      Object.keys(item)
        .forEach((key) => {
          const metadataValueList = metadataValueMap.get(key) ? metadataValueMap.get(key) : [];
          metadataValueList.push(item[key]);
          metadataValueMap.set(key, metadataValueList);
        });

    });
    return metadataValueMap;
  }
}
