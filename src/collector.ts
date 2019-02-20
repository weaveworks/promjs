import { filter, matches, each } from 'lodash';
import { findExistingMetric } from './utils';

export type CounterValue = number;
export interface HistogramValueEntries {
  [key: string]: number;
}

export interface HistogramValue {
  entries: HistogramValueEntries;
  sum: number;
  count: number;
  raw: number[];
}

export type MetricValue = CounterValue | HistogramValue;
export interface Metric<T extends MetricValue> {
  value: T;
  labels?: Labels;
}

export interface Labels {
  [key: string]: string | number;
}

export abstract class Collector<T extends MetricValue> {
  private readonly data: Metric<T>[];

  constructor() {
    this.data = [];
  }

  get(labels?: Labels): Metric<T> | undefined {
    return findExistingMetric<T>(labels, this.data);
  }

  set(value: T, labels?: Labels): this {
    const existing = findExistingMetric(labels, this.data);
    if (existing) {
      existing.value = value;
    } else {
      this.data.push({
        labels,
        value,
      });
    }

    return this;
  }

  collect(labels?: Labels): Metric<T>[] {
    return filter(this.data, item => matches(labels)(item.labels));
  }

  resetAll(): this {
    each(this.data, (d) => {
      this.reset(d.labels);
    });

    return this;
  }

  abstract reset(labels?: Labels): void;
}
