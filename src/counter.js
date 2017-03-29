import Collector from './collector';
import { add, resetCounter, resetAll } from './mixins';

export default class Counter extends Collector {
  constructor() {
    super();
    // this.set(0);
    this.inc = this.inc.bind(this);
    this.reset = this.reset.bind(this);
  }

  inc(labels) {
    return add.call(this, 1, labels);
  }

  add(amount, labels) {
    return add.call(this, amount, labels);
  }

  reset(labels) {
    return resetCounter.call(this, labels);
  }

  resetAll() {
    return resetAll.call(this);
  }
}
