import { expect } from 'chai';
import { Collector } from '../src/collector';
import { Counter } from '../src/counter';
import { Registry } from '../src/registry';

describe('Registry', () => {
  let registry: Registry;
  let counter: Counter;

  beforeEach(() => {
    registry = new Registry();
    counter = registry.create('counter', 'my_counter', 'A counter for things');
  });

  it('renders metrics to prometheus format', () => {
    let desired = '# HELP my_counter A counter for things\n';
    desired += '# TYPE my_counter counter\n';
    desired += 'my_counter 5\n';

    counter.add(5);
    expect(registry.metrics()).equals(desired);
  });

  it('renders metrics with labels to prometheus format', () => {
    let desired = '# HELP my_counter A counter for things\n';
    desired += '# TYPE my_counter counter\n';
    desired += 'my_counter{path="/org/:orgId",foo="bar"} 10\n';

    counter.add(10, { path: '/org/:orgId', foo: 'bar' });
    expect(registry.metrics()).equals(desired);
  });

  it('clear all the metrics', () => {
    counter.inc();
    registry.clear();
    expect(registry.metrics()).equals('');
  });

  it('reset all the metrics', () => {
    counter.inc();
    registry.reset();
    expect(registry.metrics()).contains('my_counter 0');
    counter.inc();
    expect(registry.metrics()).contains('my_counter 1');
  });

  it('gets a metric by name and type', () => {
    const metric = registry.get('counter', 'my_counter');
    expect(metric).instanceof(Collector);
  });

  it('prevents naming collisions', () => {
    const dupe = (): void => {
      registry.create('counter', 'counter_a');
      registry.create('counter', 'counter_a');
    };
    expect(dupe).throw();
  });
});
