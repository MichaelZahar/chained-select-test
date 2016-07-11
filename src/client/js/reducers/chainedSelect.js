import {
  CHAINED_SELECT_INIT_STATE,
  CHAINED_SELECT_SET_VALUE
} from '../constants';

/**
 * Обновляет поле value для состояния с ключем id
 *
 * Далее выполняет обход всех зависимых состояний и
 * если такие есть сбрасывает их value (value = '').
 *
 * @function
 * @param {Object} state
 * @param {string} id
 * @param {string} value
 */
const updateValue = (state, id, value) => {
  const oldValue = state[id].value;

  if (value !== oldValue) {
    // тут меняем зависимость копированием и обновлением свойства, чтобы сработала
    // проверка по ссылке в ChainedSelect.instance.shouldComponentUpdate
    state[id] = {
      ...state[id],
      value
    };

    Object.keys(state).forEach((depId) => {
      if (depId !== id) {
        const deps = state[depId].deps;
        const hasDeps = deps.some((el) => el === id);

        if (hasDeps) {
          updateValue(state, depId, '');
        }
      }
    });
  }
};

export default (state = {}, action) => {
  switch (action.type) {
  case CHAINED_SELECT_INIT_STATE:
    return {
      ...state,
      [action.payload.id]: action.payload.state
    };

  case CHAINED_SELECT_SET_VALUE:
    const { id, value } = action.payload;
    let newState = {
      ...state,
    };

    updateValue(newState, id, value);

    return newState;

  default:
    return state;
  }
};
