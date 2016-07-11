jest.unmock('../Select');

import React from 'react';
import { shallow } from 'enzyme';
import Select from '../Select';

describe('Select', () => {
  let initProps;
  let select;

  beforeEach(() => {
    initProps = {
      name: 'test-select',
      value: 'test1',
      options: [
        { name: 'test1', value: 'test1' },
        { name: 'test2', value: 'test2' },
        { name: 'test3', value: 'test3' }
      ],
      onChange: (e) => {
        select.setProps({
          value: e.target.value
        });
      }
    };

    spyOn(initProps, 'onChange');

    select = shallow(<Select {...initProps} />);
  });

  it('should render correctly', () => {
    const props = select.props();

    // проверим, что свойства установлены правильно
    expect(props.name).toBe('test-select');
    expect(props.value).toBe('test1');
    expect(
      select.find('option').length
    ).toBe(4);

    // проверим, что смена свойст работает корректно
    select.setProps({ ...props, value: 'test3' });
    expect(select.props().value).toBe('test3');

    // проверим корректное отображентя пустого значения по умолчанию
    expect(
      select.contains(<option key="-1" value="">--</option>)
    ).toBe(true);

    // проверим работу опций для отображения пустого значения
    select.setProps({ ...props, empty: { value: '0', text: 'empty' } });
    expect(
      select.contains(<option key="-1" value="0">empty</option>)
    ).toBe(true);

    // проверим отображение селетка без опций
    select.setProps({ ...props, options: [] });
    expect(
      select.find('option').length
    ).toBe(0);
  });

  it('should call onChange', () => {
    const event = { target: { value: 'test2' } };

    select.simulate('change',  event);
    expect(initProps.onChange).toHaveBeenCalledWith(event);
  });
});
