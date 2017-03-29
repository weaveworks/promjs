import { reduce, sum } from 'lodash';

import Collector from './collector';

function findBucket(ary, num) {
  const max = Math.max.apply(null, ary);
  const min = Math.min.apply(null, ary);
  // Lower than the smallest bucket
  if (num < min) { return null; }
  // Equals the smallest bucket
  if (num === min) { return min; }
  // Bigger/equal to the the largest bucket.
  if (num >= max) { return max; }

  // This works because histogram bucket arrays are sorted smallest to largest.
  for (let i = 0; i < ary.length; i += 1) {
    const bound = ary[i];
    const next = ary[i + 1];
    // End of the array;
    if (!next) { return max; }

    if (bound === num) {
      return bound;
    } else if (bound < num && num < next) {
      return bound;
    }
  }
}

function getInitialValue(buckets) {
  // Make the skeleton to which values will be saved.
  const entries = reduce(buckets, (result, b) => {
    result[b.toString()] = 0;
    return result;
  }, {});

  return {
    sum: null,
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
    this.set(getInitialValue(sorted));
    this.observe = this.observe.bind(this);
  }

  observe(value, labels) {
    let metric = this.get(labels);
    if (!metric && labels) {
      // New labels. Create a metric for the labels.
      metric = this.set(getInitialValue(this.buckets), labels).get(labels);
    }
    metric.value.raw.push(value);
    const bucket = findBucket(this.buckets, value);
    if (bucket) {
      const val = metric.value.entries[bucket.toString()];
      metric.value.entries[bucket.toString()] = val + 1;
    }

    metric.value.sum = sum(metric.value.raw);
    metric.value.count += 1;
  }
}
