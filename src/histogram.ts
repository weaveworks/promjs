import { reduce, sum } from 'lodash';

import { Collector } from './collector';
import { HistogramValue, HistogramValueEntries, Labels } from './types';

function findMinBucketIndex(ary: number[], num: number): number | undefined {
  if (num < ary[ary.length - 1]) {
    for (let i = 0; i < ary.length; i += 1) {
      if (num <= ary[i]) {
        return i;
      }
    }
  }

  return undefined;
}

function getInitialValue(buckets: number[]): HistogramValue {
  // Make the skeleton to which values will be saved.
  const entries = reduce(buckets, (result, b) => {
    result[b.toString()] = 0;
    return result;
  }, { '+Inf': 0 } as HistogramValueEntries);

  return {
    entries,
    sum: 0,
    count: 0,
    raw: [],
  };
}

export class Histogram extends Collector<HistogramValue> {
  private readonly buckets: number[];

  constructor(buckets: number[] = []) {
    super();
    // Sort to get smallest -> largest in order.
    this.buckets = buckets.sort((a, b) => (a > b ? 1 : -1));
    this.set(getInitialValue(this.buckets));
    this.observe = this.observe.bind(this);
  }

  observe(value: number, labels?: Labels): this {
    let metric = this.get(labels);
    if (metric == null) {
      // Create a metric for the labels.
      metric = this.set(getInitialValue(this.buckets), labels).get(labels)!;
    }

    metric.value.raw.push(value);
    metric.value.entries['+Inf'] += 1;

    const minBucketIndex = findMinBucketIndex(this.buckets, value);

    if (minBucketIndex != null) {
      for (let i = minBucketIndex; i < this.buckets.length; i += 1) {
        const val = metric.value.entries[this.buckets[i].toString()];
        metric.value.entries[this.buckets[i].toString()] = val + 1;
      }
    }

    metric.value.sum = sum(metric.value.raw);
    metric.value.count += 1;

    return this;
  }

  reset(labels?: Labels): void {
    this.set(getInitialValue(this.buckets), labels);
  }
}
