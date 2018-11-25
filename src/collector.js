import filter from 'lodash/filter';
import matches from 'lodash/matches';
import { findExistingMetric } from './utils';

export default class Collector {
  constructor() {
    this.data = [];
  }

  set(value, labels) {
    const existing = findExistingMetric(labels, this.data);
    if (existing) {
      existing.value = value;
    } else {
      this.data.push({
        ...labels,
        value
      });
    }
    return this;
  }

  get(labels) {
    return findExistingMetric(labels, this.data);
  }

  collect(labels) {
    return filter(this.data, matches(labels));
  }

  clearAll() {
    this.data = [];
    return this;
  }
}
