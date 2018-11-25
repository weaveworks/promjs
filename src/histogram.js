import reduce from 'lodash/reduce';
import sum from 'lodash/sum';

import { resetAll } from './mixins';
import Collector from './collector';

function findMinBucketIndex(ary, num) {
  if (num > ary[ary.length - 1]) { return null; }

  for (let i = 0; i < ary.length; i += 1) {
    if (num <= ary[i]) {
      return i;
    }
  }
}

function getInitialValue(buckets) {
  // Make the skeleton to which values will be saved.
  const entries = reduce(buckets, (result, b) => {
    result[b.toString()] = 0;
    return result;
  }, { '+Inf': 0 });

  return {
    sum: 0,
    count: 0,
    entries,
    raw: []
  };
}

export default class Histogram extends Collector {
  constructor(buckets) {
    super();
    // Sort to get smallest -> largest in order.
    const sorted = buckets.sort((a, b) => a > b ? 1 : -1);
    this.buckets = sorted;
    this.set(getInitialValue(this.buckets));
    this.observe = this.observe.bind(this);
  }

  observe(value, labels) {
    let metric = this.get(labels);
    if (!metric) {
      //Create a metric for the labels.
      metric = this.set(getInitialValue(this.buckets), labels).get(labels);
    }

    metric.value.raw.push(value);
    metric.value.entries['+Inf']++;

    const minBucketIndex = findMinBucketIndex(this.buckets, value);

    if (minBucketIndex !== null) {
      for (let i = minBucketIndex; i < this.buckets.length; i++) {
        const val = metric.value.entries[this.buckets[i].toString()];
        metric.value.entries[this.buckets[i].toString()] = val + 1;
      }
    }

    metric.value.sum = sum(metric.value.raw);
    metric.value.count += 1;
    return this;
  }

  reset(labels) {
    this.set(getInitialValue(this.buckets), labels);
    return this;
  }

  resetAll() {
    return resetAll.call(this);
  }
}
