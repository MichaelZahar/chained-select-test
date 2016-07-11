import {
  CHAINED_SELECT_INIT_STATE,
  CHAINED_SELECT_SET_VALUE
} from '../constants';

export const initChainedSelectState = (id, state) => {
  return {
    type: CHAINED_SELECT_INIT_STATE,
    payload: {
      id,
      state
    }
  };
};

export const setChainedSelectValue = (id, value) => {
  return {
    type: CHAINED_SELECT_SET_VALUE,
    payload: {
      id,
      value
    }
  };
};
