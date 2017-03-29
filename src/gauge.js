import Collector from './collector';
import { add, resetCounter, resetAll } from './mixins';

export default class Gauge extends Collector {
  constructor(name, help) {
    super('gauge', name, help);
    // this.set(0);
    this.inc = this.inc.bind(this);
    this.dec = this.dec.bind(this);
    this.add = this.add.bind(this);
    this.sub = this.sub.bind(this);
  }

  inc(labels) {
    return add.call(this, 1, labels);
  }

  dec(labels) {
    const metric = this.get(labels);
    this.set(metric ? metric.value - 1 : 0, labels);
    return this;
  }

  add(amount, labels) {
    return add.call(this, amount, labels);
  }

  sub(amount, labels) {
    const metric = this.get(labels);
    this.set(metric ? metric.value - amount : 0, labels);
    return this;
  }

  reset(labels) {
    return resetCounter.call(this, labels);
  }

  resetAll() {
    return resetAll.call(this);
  }
}
