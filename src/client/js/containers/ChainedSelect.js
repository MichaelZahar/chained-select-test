import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Select from '../components/Select';
import { setChainedSelectValue, initChainedSelectState } from '../actions';

export const getOptions = (state, ownState) => {
  const { deps, options } = ownState;
  const withoutDeps = !deps || deps.length === 0;
  const depsEmpty = !withoutDeps && deps.some(depId => state[depId].value === '');
  let newOptions;

  if (withoutDeps) {
    newOptions = options;
  } else if (depsEmpty) {
    newOptions = [];
  } else {
    newOptions = options.filter((el) => {
      return deps.every((depId) => {
        let dep = state[depId];

        return el[dep.name].indexOf(dep.value) !== -1;
      });
    });
  }

  return newOptions;
};

export const mapStateToProps = (state, ownState) => {
  const value = state[ownState.id] && state[ownState.id].value || ownState.value || '';
  const newOptions = getOptions(state, ownState);

  return {
    options: newOptions,
    selectsState: state,
    value
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleChange(id, value) {
      dispatch(setChainedSelectValue(id, value));
    },

    setState(id, state) {
      dispatch(initChainedSelectState(id, state));
    }
  };
};

export class ChainedSelect extends Component {
  static propTypes = {
    /**
     * id chained select (можно было использовать name, но тогда может некорректно
     * работать приложение с двумя формами, у которых есть поля с одинаковым name.
     */
    id: PropTypes.string.isRequired,

    name: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    value: PropTypes.string,

    /**
     * Список id select-ов, значения которых влияют на список опций данного select
     */
    deps: PropTypes.array,

    /**
     * Настройки для отображения первого пустого элемента
     */
    empty: PropTypes.object
  }

  static defaultProps = {
    value: '',
    deps: []
  }

  componentWillMount() {
    const { setState, id, name, value, deps } = this.props;

    setState(id, { name, value, deps });
  }

  shouldComponentUpdate(nextProps) {
    const { value, deps, selectsState } = this.props;

    const depsChanged = deps.some((depId) => {
      const state = selectsState[depId];
      const newState = nextProps.selectsState[depId];

      return state !== newState;
    });

    return nextProps.value !== value || depsChanged;
  }

  onChange(e) {
    this.props.handleChange(this.props.id, e.target.value);
  }

  render() {
    const { options, name, value, empty } = this.props;

    return (
      <Select
        name={name}
        value={value}
        options={options}
        onChange={::this.onChange}
        empty={empty}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChainedSelect);
