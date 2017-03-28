import should from 'should';

import Registry from '../src/registry';
import Collector from '../src/collector';

describe('Registry', function () {
  let reg, counter;

  beforeEach(() => {
    reg = new Registry();
    counter = reg.create('counter', 'my_counter', 'A counter for things');
  });
  it('renders metrics to prometheus format', () => {
    let desired = '# HELP my_counter A counter for things\n';
    desired += '# TYPE my_counter counter\n';
    desired += 'my_counter 5\n';

    counter.add(5);
    reg.metrics().should.equal(desired);
  });
  it('renders metrics with labels to prometheus format', () => {
    let desired = '# HELP my_counter A counter for things\n';
    desired += '# TYPE my_counter counter\n';
    desired += 'my_counter 0\n';
    desired += 'my_counter{path="/org/:orgId",foo="bar"} 10\n';

    counter.add(10, { path: '/org/:orgId', foo: 'bar' });
    reg.metrics().should.equal(desired);
  });
  it('clears all the metrics', () => {
    counter.inc();
    reg.clear();
    reg.metrics().should.containEql('my_counter 0');
    counter.inc();
    reg.metrics().should.containEql('my_counter 1');
  });
  it('gets a metric by name', () => {
    const metric = reg.get('my_counter');
    metric.should.be.an.Object();
    metric.should.be.an.instanceof(Collector);
  });
  it('prevents naming collisions', () => {
    const dupe = () => {
      reg.create('counter', 'counter_a');
      reg.create('counter', 'counter_a');
    };
    should(dupe).throw();
  });
});
