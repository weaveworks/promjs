import { formatCounterOrGauge, formatHistogramOrSummary } from '../src/utils';

describe('utils', () => {
  it('formats a counter/gauge metric', () => {
    const simple = { value: 2 };
    const complex = { ok: true, status: 'success', code: 200, value: 1 };

    formatCounterOrGauge('my_counter', simple).should.equal('my_counter 2\n');
    formatCounterOrGauge('my_counter', complex).should.equal(
      'my_counter{ok="true",status="success",code="200"} 1\n'
    );
  });
  it('formats a historgram metric', () => {
    let desired = '';
    desired += 'my_histogram_count 2\n';
    desired += 'my_histogram_sum 501\n';
    desired += 'my_histogram_bucket{le="200"} 0\n';
    desired += 'my_histogram_bucket{le="300"} 2\n';
    desired += 'my_histogram_bucket{le="400"} 0\n';
    desired += 'my_histogram_bucket{le="500"} 0\n';
    const simple = {
      value: {
        sum: 501,
        count: 2,
        entries: { '200': 0, '300': 2, '400': 0, '500': 0 },
        raw: [ 201, 300 ]
      }
    };
    const complex = { ...simple, instance: 'some_instance', ok: true };
    formatHistogramOrSummary('my_histogram', simple).should.equal(desired);

    desired =  'my_histogram_count{instance="some_instance",ok="true"} 2\n';
    desired += 'my_histogram_sum{instance="some_instance",ok="true"} 501\n';
    desired += 'my_histogram_bucket{le="200",instance="some_instance",ok="true"} 0\n';
    desired += 'my_histogram_bucket{le="300",instance="some_instance",ok="true"} 2\n';
    desired += 'my_histogram_bucket{le="400",instance="some_instance",ok="true"} 0\n';
    desired += 'my_histogram_bucket{le="500",instance="some_instance",ok="true"} 0\n';

    formatHistogramOrSummary('my_histogram', complex).should.equal(desired);
  });
  it.skip('formats a summary metric', () => {

  });
});
