import each from 'lodash/each';
import omit from 'lodash/omit';

export function add(amount, labels) {
  if (typeof amount !== 'number') {
    throw new Error(`Expected ${amount} to be a number. Check the arguments to 'increment'`);
  }

  if (amount < 0) {
    throw new Error(`Expected increment amount to be greater than -1. Received: ${amount}`);
  }
  const metric = this.get(labels);
  this.set(metric ? metric.value + amount : amount, labels);
  return this;
}

export function resetCounter(labels) {
  this.set(0, labels);
  return this;
}

export function resetAll() {
  each(this.data, (d) => {
    this.reset(omit(d, 'value'));
  });
  return this;
}
