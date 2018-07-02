import Histogram from '../src/histogram';

describe('Histogram', function () {
  let histogram;

  beforeEach(() => {
    histogram = new Histogram([
      200,
      400,
      750,
      1000
    ]);
  });
  it('observes some values', () => {
    histogram.observe(380);
    histogram.observe(400);
    histogram.observe(199);
    histogram.observe(1200);
    const result = histogram.collect();
    result.length.should.equal(1);
    result[0].value.should.containEql({
      sum: 2179,
      count: 4,
      entries: {
        '200': 1,
        '400': 3,
        '750': 3,
        '1000': 3,
        '+Inf': 4
      }
    });
  });
  it('clears observed values', () => {
    histogram.observe(380);
    histogram.observe(400);
    histogram.observe(199);
    histogram.reset();
    const result = histogram.collect();
    result.should.deepEqual([{
      value: {
        sum: 0,
        count: 0,
        raw: [],
        entries: {
          '200': 0,
          '400': 0,
          '750': 0,
          '1000': 0,
          '+Inf': 0
        }
      }
    }]);
    result.length.should.equal(1);
  });
});
