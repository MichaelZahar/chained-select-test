import React, { Component } from 'react';
import ChainedSelect from './ChainedSelect';

const marksList = [
  { name: 'Audi' },
  { name: 'BMW' }
];

const seriesList = [
  { name: 'a3', mark: ['Audi'] },
  { name: 'a4', mark: ['Audi'] },
  { name: 'a5', mark: ['Audi'] },
  { name: 'series-3', mark: ['BMW'] },
  { name: 'series-5', mark: ['BMW'] },
  { name: 'series-6', mark: ['BMW'] }
];

const modelsList = [
  { name: 'coupe', series: ['a5', 'series-3', 'series-6'] },
  { name: 'cabrio', series: ['a3', 'a5', 'series-3', 'series-6'] },
  { name: 'sedan', series: ['a3', 'a4', 'series-3', 'series-5'] },
  { name: 'sportback', series: ['a3', 'a5'] }
];

export default class App extends Component {
  render() {
    // value можно не передавать, но такая возможность предусмотрена
    const mark = '';
    // const mark = 'Audi';

    return (
      <form>
        <ChainedSelect
          id="car-mark"
          name="mark"
          value={mark}
          options={marksList}
          empty={{ text: 'Choose mark…', value: '' }}
        />
        <ChainedSelect
          id="car-series"
          name="series"
          options={seriesList}
          deps={['car-mark']}
          empty={{ text: 'Choose series…', value: '' }}
        />
        <ChainedSelect
          id="car-model"
          name="model"
          options={modelsList}
          deps={['car-series']}
          empty={{ text: 'Choose model…', value: '' }}
        />
      </form>
    );
  }
}
