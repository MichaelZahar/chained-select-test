jest.unmock('../ChainedSelect');

import React from 'react';
import { mount, shallow } from 'enzyme';
import { ChainedSelect, getOptions, mapStateToProps } from '../ChainedSelect';

describe('ChainedSelect', () => {
  describe('mapStateToProps', () => {
    let state;

    beforeEach(() => {
      state = {
        'test-field': {
          name: 'test',
          value: 'test-value',
        },
        'empty-test-field': {
          name: 'empty-test',
          value: '',
        },
        'dep-test-field': {
          name: 'dep-test',
          value: '',
        },
        'other-dep-test-field': {
          name: 'other-dep-test',
          value: '',
        }
      };
    });

    it('should select options', () => {
      // without deps
      let options = [
        { name: 'test1', 'test': [ 'test-value', 'test-value1' ] },
        { name: 'test2', 'test': [ 'test-value1' ] }
      ];
      const propsWithoutDeps = {
        id: 'test-field',
        options: options
      };
      const propsWithEmptyDeps = {
        id: 'dep-test-field',
        options: options,
        deps: ['empty-test-field']
      };
      const propsWithDeps = {
        id: 'other-dep-test-field',
        options: options,
        deps: ['test-field']
      };

      // without deps
      expect(
        getOptions(state, propsWithoutDeps)
      ).toEqual(options);

      expect(
        mapStateToProps(state, propsWithoutDeps)
      ).toEqual({
        options,
        selectsState: state,
        value: 'test-value'
      });

      // empty deps
      expect(
        getOptions(state, propsWithEmptyDeps)
      ).toEqual([]);

      // with deps
      expect(
        getOptions(state, propsWithDeps)
      ).toEqual([ options[0] ]);
    });
  });

  describe('<ChainedSelect />', () => {
    let initProps;
    let select;

    beforeEach(() => {
      initProps = {
        id: 'test-field',
        name: 'test',
        value: 'test1',
        options: [
          { name: 'test1', value: 'test1' },
          { name: 'test2', value: 'test2' },
          { name: 'test3', value: 'test3' }
        ],
        handleChange() {
        },
        setState() {
        }
      };

      spyOn(ChainedSelect.prototype, 'componentWillMount').and.callThrough();
      spyOn(ChainedSelect.prototype, 'shouldComponentUpdate').and.callThrough();
      spyOn(ChainedSelect.prototype, 'onChange').and.callThrough();
      spyOn(initProps, 'handleChange');
      spyOn(initProps, 'setState');

      select = shallow(<ChainedSelect {...initProps} />);
    });

    it('should render correctly', () => {
      const props = select.props();

      // проверим, что свойства установлены правильно
      expect(props.name).toBe('test');
      expect(props.value).toBe('test1');
    });

    it('should call component methods', () => {
      const props = select.props();

      expect(ChainedSelect.prototype.componentWillMount).toHaveBeenCalled();
      expect(initProps.setState).toHaveBeenCalledWith(
        initProps.id,
        {
          name: initProps.name,
          value: initProps.value,
          deps: []
        }
      );
      expect(ChainedSelect.prototype.shouldComponentUpdate).not.toHaveBeenCalled();
      select.setProps({
        ...props,
        value: 'test2'
      });
      expect(ChainedSelect.prototype.shouldComponentUpdate).toHaveBeenCalled();
      expect(ChainedSelect.prototype.onChange).not.toHaveBeenCalled();

      const event = { target: { value: 'test3' } };

      select.simulate('change',  event);
      expect(ChainedSelect.prototype.onChange).toHaveBeenCalledWith(event);
      expect(initProps.handleChange).toHaveBeenCalledWith(
        initProps.id,
        event.target.value
      );
    });

    it('should call `shouldComponentUpdate`', () => {
      const oldState = {
        department: {
          name: 'department',
          value: 'QA'
        }
      };
      const newState = {
        department: {
          name: 'department',
          value: 'HR'
        }
      };
      const shouldComponentUpdate = ChainedSelect.prototype.shouldComponentUpdate.bind({
        props: {
          value: 'test',
          deps: ['department'],
          selectsState: oldState
        }
      });

      const nextPropsNotChanged = {
        value: 'test',
        selectsState: oldState
      };

      expect(shouldComponentUpdate(nextPropsNotChanged)).toBe(false);

      const nextPropsValueChanged = {
        value: 'test1',
        selectsState: oldState
      };

      expect(shouldComponentUpdate(nextPropsValueChanged)).toBe(true);

      const nextPropsStateChanged = {
        value: 'test1',
        selectsState: newState
      };

      expect(shouldComponentUpdate(nextPropsValueChanged)).toBe(true);
    });
  });
});
