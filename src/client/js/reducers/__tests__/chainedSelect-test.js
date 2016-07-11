jest.unmock('../../reducers/chainedSelect');
jest.unmock('../../constants');

import reducer from '../../reducers/chainedSelect';
import {
  CHAINED_SELECT_INIT_STATE,
  CHAINED_SELECT_SET_VALUE
} from '../../constants';


describe('chainedSelect reducer', () => {
  let testState;

  beforeEach(() => {
    testState = {
      'test-field': {
        name: 'test',
        value: 'test-value',
        deps: []
      }
    };
  });

  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual({});
  });

  it('should handle CHAINED_SELECT_INIT_STATE', () => {
    expect(
      reducer(
        {},
        {
          type: CHAINED_SELECT_INIT_STATE,
          payload: {
            id: 'test-field',
            state: {
              name: 'test',
              value: 'test-value',
              deps: []
            }
          }
        }
      )
    ).toEqual(testState);
  });

  it('should handle CHAINED_SELECT_SET_VALUE', () => {
    const oldState = {
      ...testState,
      // у этого состояния должно сброситься значение value
      'dependent-test-field': {
        name: 'dep-test',
        value: 'dep-test-value',
        deps: ['test-field']
      },
      // это состояние не должно меняться (сброс пустого значения не имеет смысла)
      'other-dependent-test-field': {
        name: 'other-dep-test',
        value: '',
        deps: ['dependent-test-field']
      },
      // это состояние должно игнорироваться, так как его значение не меняет
      // и оно не зависит от других состояний
      'other-test-field': {
        name: 'other-test',
        value: 'other-test-value',
        deps: []
      }
    };

    expect(
      reducer(
        oldState,
        {
          type: CHAINED_SELECT_SET_VALUE,
          payload: {
            id: 'test-field',
            value: 'new-test-value'
          }
        }
      )
    ).toEqual({
      'test-field': {
        name: 'test',
        value: 'new-test-value',
        deps: []
      },
      'dependent-test-field': {
        name: 'dep-test',
        value: '',
        deps: ['test-field']
      },
      'other-dependent-test-field': {
        name: 'other-dep-test',
        value: '',
        deps: ['dependent-test-field']
      },
      'other-test-field': {
        name: 'other-test',
        value: 'other-test-value',
        deps: []
      }
    });
  });
});
