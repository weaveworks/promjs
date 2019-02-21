import { expect } from 'chai';
import { Gauge } from '../src/gauge';

describe('Gauge', () => {
  let gauge: Gauge;

  beforeEach(() => {
    gauge = new Gauge();
  });

  it('sets the gauge', () => {
    const value = 55;

    expect(gauge.set(value).get()!.value).equals(value);
  });
  it('increments and decrements values', () => {
    expect(gauge.inc().get()!.value).equals(1);
    expect(gauge.dec().get()!.value).equals(0);

    gauge.inc({ label: 'foo' });
    gauge.dec({ label: 'foo' });
    expect(gauge.collect().length).equals(2);
  });

  it('adds and subtracts from values', () => {
    const amount = 10;
    const amountSub = 5;

    expect(gauge.add(amount).get()!.value).equals(amount);
    expect(gauge.sub(amountSub).get()!.value).equals(amount - amountSub);

    gauge.add(amount, { label: 'foo' });
    gauge.sub(amountSub, { label: 'foo' });

    expect(gauge.collect().length).equals(2);
  });
});
