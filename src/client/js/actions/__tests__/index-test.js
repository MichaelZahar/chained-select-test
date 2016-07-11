jest.unmock('../../actions');
jest.unmock('../../constants');

import {
  initChainedSelectState,
  setChainedSelectValue
} from '../../actions';
import {
  CHAINED_SELECT_INIT_STATE,
  CHAINED_SELECT_SET_VALUE
} from '../../constants';

describe('actions', () => {
  it('should create an action to set initial chainedSelect state', () => {
    const id = 'test-field';
    const state = {
      name: 'test',
      value: 'default',
      deps: ['main-field']
    };

    expect(
      initChainedSelectState(id, state)
    ).toEqual({
      type: CHAINED_SELECT_INIT_STATE,
      payload: {
        id,
        state
      }
    });
  });

  it('should create an action to set new chainedSelect\'s value', () => {
    const id = 'test-field';
    const value = 'new-value';

    expect(
      setChainedSelectValue(id, value)
    ).toEqual({
      type: CHAINED_SELECT_SET_VALUE,
      payload: {
        id,
        value
      }
    });
  });
});
