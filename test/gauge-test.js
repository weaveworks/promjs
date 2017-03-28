import Gauge from '../src/gauge';

describe('Gauge', function () {
  let gauge;

  beforeEach(() => {
    gauge = new Gauge();
  });
  it('sets the gauge', () => {
    gauge.set(55).get().value.should.equal(55);
  });
  it('increments and decrements values', () => {
    gauge.inc().get().value.should.equal(1);
    gauge.dec().get().value.should.equal(0);
    gauge.inc({ label: 'foo' });
    gauge.dec({ label: 'foo' });
    gauge.collect().length.should.equal(2);
  });
  it('adds and subtracts from values', () => {
    gauge.add(10).get().value.should.equal(10);
    gauge.sub(5).get().value.should.equal(5);
    gauge.add(10, { label: 'foo' });
    gauge.sub(5, { label: 'foo' });
    gauge.collect().length.should.equal(2);
  });
});
