import Collector from '../src/collector';

describe('Collector', function () {
  let collector;

  beforeEach(() => {
    collector = new Collector();
  });
  it('sets and gets a value', () => {
    collector.set(5);
    collector.collect().should.deepEqual([{
      value: 5
    }]);
  });
  it('sets and gets a value by label', () => {
    collector.set(10, { some_label: 'my_value' });
    collector.collect({ some_label: 'my_value' }).should.deepEqual([{
      some_label: 'my_value',
      value: 10
    }]);
  });
});
