import { createStore } from 'redux';
import chainedSelect from '../reducers/chainedSelect';

export function configureStore() {
  const store = createStore(chainedSelect);

  return store;
}
