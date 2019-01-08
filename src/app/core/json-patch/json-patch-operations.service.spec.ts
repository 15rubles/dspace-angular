import { cold, getTestScheduler } from 'jasmine-marbles';

import { TestScheduler } from 'rxjs/testing';
import { of as observableOf } from 'rxjs';
import { Store } from '@ngrx/store';

import { getMockRequestService } from '../../shared/mocks/mock-request.service';
import { ResponseCacheService } from '../cache/response-cache.service';
import { RequestService } from '../data/request.service';
import { SubmissionPatchRequest } from '../data/request.models';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service-stub';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { getMockRemoteDataBuildService } from '../../shared/mocks/mock-remote-data-build.service';
import { JsonPatchOperationsService } from './json-patch-operations.service';
import { SubmitDataResponseDefinitionObject } from '../shared/submit-data-response-definition.model';
import { CoreState } from '../core.reducers';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { JsonPatchOperationsEntry, JsonPatchOperationsResourceEntry } from './json-patch-operations.reducer';
import { MockStore } from '../../shared/testing/mock-store';
import {
  CommitPatchOperationsAction,
  RollbacktPatchOperationsAction,
  StartTransactionPatchOperationsAction
} from './json-patch-operations.actions';

class TestService extends JsonPatchOperationsService<SubmitDataResponseDefinitionObject, SubmissionPatchRequest> {
  protected linkPath = '';
  protected patchRequestConstructor = SubmissionPatchRequest;

  constructor(
    protected responseCache: ResponseCacheService,
    protected requestService: RequestService,
    protected store: Store<CoreState>,
    protected halService: HALEndpointService) {

    super();
  }
}

describe('JsonPatchOperationsService test suite', () => {
  let scheduler: TestScheduler;
  let service: TestService;
  let responseCache: ResponseCacheService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let halService: any;
  let store: any;

  const timestamp = 1545994811991;
  const timestampResponse = 1545994811992;
  const mockState = {
    'json/patch': {
      testResourceType: {
        children: {
          testResourceId: {
            body: [
              {
                operation: {
                  op: 'add',
                  path: '/testResourceType/testResourceId/testField',
                  value: ['test']
                },
                timeAdded: timestamp
              },
            ]
          } as JsonPatchOperationsEntry
        },
        transactionStartTime: null,
        commitPending: false
      } as JsonPatchOperationsResourceEntry
    }
  };
  const resourceEndpointURL = 'https://rest.api/endpoint';
  const resourceEndpoint = 'resource';
  const resourceScope = '260';
  const resourceHref = resourceEndpointURL + '/' + resourceEndpoint + '/' + resourceScope;

  const testJsonPatchResourceType = 'testResourceType';
  const testJsonPatchResourceId = 'testResourceId';
  const patchOpBody = [{
    op: 'add',
    path: '/testResourceType/testResourceId/testField',
    value: ['test']
  }];

  function initMockResponseCacheService(isSuccessful: boolean): ResponseCacheService {
    return jasmine.createSpyObj('responseCache', {
      get: cold('c-', {
        c: {response: {isSuccessful},
            timeAdded: timestampResponse}
      })
    });
  }

  function initTestService(): TestService {
    return new TestService(
      responseCache,
      requestService,
      store,
      halService
    );

  }

  beforeEach(() => {
    store = new MockStore<CoreState>({} as CoreState);
    responseCache = initMockResponseCacheService(true);
    requestService = getMockRequestService();
    rdbService = getMockRemoteDataBuildService();
    scheduler = getTestScheduler();
    halService = new HALEndpointServiceStub(resourceEndpointURL);
    service = initTestService();

    spyOn((service as any).store, 'select').and.returnValue(observableOf(mockState['json/patch'][testJsonPatchResourceType]));
    spyOn((service as any).store, 'dispatch').and.callThrough();
    spyOn(Date.prototype, 'getTime').and.callFake(() => {
      return timestamp;
    });
  });

  describe('jsonPatchByResourceType', () => {

    it('should call submitJsonPatchOperations method', () => {
      spyOn((service as any), 'submitJsonPatchOperations').and.callThrough();

      scheduler.schedule(() => service.jsonPatchByResourceType(resourceEndpointURL, resourceScope, testJsonPatchResourceType).subscribe());
      scheduler.flush();

      expect((service as any).submitJsonPatchOperations).toHaveBeenCalled();
    });

    it('should configure a new SubmissionPatchRequest', () => {
      const expected = new SubmissionPatchRequest(requestService.generateRequestId(), resourceHref, patchOpBody);
      scheduler.schedule(() => service.jsonPatchByResourceType(resourceEndpoint, resourceScope, testJsonPatchResourceType).subscribe());
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(expected, true);
    });

    it('should dispatch a new StartTransactionPatchOperationsAction', () => {
      const expectedAction = new StartTransactionPatchOperationsAction(testJsonPatchResourceType, undefined, timestamp);
      scheduler.schedule(() => service.jsonPatchByResourceType(resourceEndpoint, resourceScope, testJsonPatchResourceType).subscribe());
      scheduler.flush();

      expect((service as any).store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    describe('when request is successful', () => {
      it('should dispatch a new CommitPatchOperationsAction', () => {
        const expectedAction = new CommitPatchOperationsAction(testJsonPatchResourceType, undefined);
        scheduler.schedule(() => service.jsonPatchByResourceType(resourceEndpoint, resourceScope, testJsonPatchResourceType).subscribe());
        scheduler.flush();

        expect((service as any).store.dispatch).toHaveBeenCalledWith(expectedAction);
      });
    });

    describe('when request is not successful', () => {
      beforeEach(() => {
        store = new MockStore<CoreState>({} as CoreState);
        responseCache = initMockResponseCacheService(false);
        requestService = getMockRequestService();
        rdbService = getMockRemoteDataBuildService();
        scheduler = getTestScheduler();
        halService = new HALEndpointServiceStub(resourceEndpointURL);
        service = initTestService();

        spyOn((service as any).store, 'select').and.returnValue(observableOf(mockState['json/patch'][testJsonPatchResourceType]));
        spyOn((service as any).store, 'dispatch').and.callThrough();
      });

      it('should dispatch a new RollbacktPatchOperationsAction', () => {

        const expectedAction = new RollbacktPatchOperationsAction(testJsonPatchResourceType, undefined);
        scheduler.schedule(() => service.jsonPatchByResourceType(resourceEndpoint, resourceScope, testJsonPatchResourceType).subscribe());
        scheduler.flush();

        expect((service as any).store.dispatch).toHaveBeenCalledWith(expectedAction);
      });
    });
  });

  describe('jsonPatchByResourceID', () => {

    it('should call submitJsonPatchOperations method', () => {
      spyOn((service as any), 'submitJsonPatchOperations').and.callThrough();

      scheduler.schedule(() => service.jsonPatchByResourceID(resourceEndpointURL, resourceScope, testJsonPatchResourceType, testJsonPatchResourceId).subscribe());
      scheduler.flush();

      expect((service as any).submitJsonPatchOperations).toHaveBeenCalled();
    });

    it('should configure a new SubmissionPatchRequest', () => {
      const expected = new SubmissionPatchRequest(requestService.generateRequestId(), resourceHref, patchOpBody);
      scheduler.schedule(() => service.jsonPatchByResourceID(resourceEndpoint, resourceScope, testJsonPatchResourceType, testJsonPatchResourceId).subscribe());
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(expected, true);
    });

    it('should dispatch a new StartTransactionPatchOperationsAction', () => {
      const expectedAction = new StartTransactionPatchOperationsAction(testJsonPatchResourceType, testJsonPatchResourceId, timestamp);
      scheduler.schedule(() => service.jsonPatchByResourceID(resourceEndpoint, resourceScope, testJsonPatchResourceType, testJsonPatchResourceId).subscribe());
      scheduler.flush();

      expect((service as any).store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    describe('when request is successful', () => {
      it('should dispatch a new CommitPatchOperationsAction', () => {
        const expectedAction = new CommitPatchOperationsAction(testJsonPatchResourceType, testJsonPatchResourceId);
        scheduler.schedule(() => service.jsonPatchByResourceID(resourceEndpoint, resourceScope, testJsonPatchResourceType, testJsonPatchResourceId).subscribe());
        scheduler.flush();

        expect((service as any).store.dispatch).toHaveBeenCalledWith(expectedAction);
      });
    });

    describe('when request is not successful', () => {
      beforeEach(() => {
        store = new MockStore<CoreState>({} as CoreState);
        responseCache = initMockResponseCacheService(false);
        requestService = getMockRequestService();
        rdbService = getMockRemoteDataBuildService();
        scheduler = getTestScheduler();
        halService = new HALEndpointServiceStub(resourceEndpointURL);
        service = initTestService();

        spyOn((service as any).store, 'select').and.returnValue(observableOf(mockState['json/patch'][testJsonPatchResourceType]));
        spyOn((service as any).store, 'dispatch').and.callThrough();
      });

      it('should dispatch a new RollbacktPatchOperationsAction', () => {

        const expectedAction = new RollbacktPatchOperationsAction(testJsonPatchResourceType, testJsonPatchResourceId);
        scheduler.schedule(() => service.jsonPatchByResourceID(resourceEndpoint, resourceScope, testJsonPatchResourceType, testJsonPatchResourceId).subscribe());
        scheduler.flush();

        expect((service as any).store.dispatch).toHaveBeenCalledWith(expectedAction);
      });
    });
  });

});
