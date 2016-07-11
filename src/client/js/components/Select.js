import React from 'react';

const defaultEmpty = { text: '--', value: '' };

/**
 * Простой компонент, который выводит select с обработчиком onChange
 *
 * Комонент так же:
 * - добавляет первый пустой элемен
 * -
 */
export default ({ name, value, options, onChange, empty = defaultEmpty }) => {
  const withoutOptions = options.length === 0;

  return (
    <select name={name} value={value} onChange={onChange} disabled={withoutOptions}>
      <option key="-1" value={empty.value}>{empty.text}</option>
      {options && options.map((option, i) => (<option key={i} value={option.value}>{option.name}</option>))}
    </select>
  );
};
