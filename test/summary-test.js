import { each, sum, first } from 'lodash';

import  Summary from '../src/summary';

describe('Summary', () => {
  let summary;

  beforeEach(() => {
    summary = new Summary();
  });
  it('records default quantiles', () => {
    const values = [];
    for (let i = 0; i < 100; i +=1) {
      values.push(i);
    }

    each(values, n => summary.observe(n));

    const result = first(summary.collect());
    result.should.containEql({
      value: {
        sum: sum(values),
        raw: values,
        count: values.length,
        entries: {
          '0.5': 50,
          '0.9': 90,
          '0.99': 99
        }
      }
    });
  });
  it('records custom quantiles', () => {
    const values = [];
    const customSummary = new Summary([
      0.667,
      0.743,
      0.887
    ]);

    for (let i = 0; i < 100; i +=1) {
      values.push(i);
    }

    each(values, n => customSummary.observe(n));

    const result = first(customSummary.collect());
    result.should.containEql({
      value: {
        sum: sum(values),
        count: values.length,
        raw: values,
        entries: {
          '0.667': 66,
          '0.743' : 74,
          '0.887' : 88
        }
      }
    });
  });
});
