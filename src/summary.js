import { reduce, sum, concat } from 'lodash';
import { TDigest } from 'tdigest';

import { resetAll, reset } from './mixins';
// import { getInitialValue } from './utils';
import Collector from './collector';


const DEFAULT_QUANTILES = [0.5, 0.9, 0.99];

function calculate(quantiles, values) {
  const count = values.length;
  return reduce(quantiles, (result, q) => {
    const index = Math.floor(count * q);
    result[q.toString()] = values[index];
    // debugger;
    return result;
  }, {});
}

export default class Summary extends Collector {
  constructor(quantiles = DEFAULT_QUANTILES) {
    super();

    this.quantiles = quantiles;

    this.observe = this.observe.bind(this);
    this.collect = this.collect.bind(this);
    this.reset = reset.bind(this);
    this.resetAll = resetAll.bind(this);
  }

  observe(value, labels) {
    let metric = this.get(labels);

    if (!metric) {
      metric = this.set({ td: new TDigest() }, labels).get(labels);
    }
    metric.value.td.push(value);
    const next = concat(metric.value.raw, value);
    // const entries = calculate(this.quantiles, next);

    this.set({ raw: next, td: metric.value.td, sum: sum(next), count: next.length }, labels);
    return this;
  }
}
