import { find, isEqual, map, reduce } from 'lodash';
import { HistogramValue, Labels, Metric, MetricValue } from './collector';

function getLabelPairs(metric: Metric<MetricValue>): string {
  const pairs = map(metric.labels, (v, k) => `${k}="${v}"`);
  return pairs.length === 0 ? '' : `${pairs.join(',')}`;
}

export function formatHistogramOrSummary(
  name: string,
  metric: Metric<HistogramValue>,
  bucketLabel = 'le',
): string {
  let str = '';
  const labels = getLabelPairs(metric);
  if (labels.length > 0) {
    str += `${name}_count{${labels}} ${metric.value.count}\n`;
    str += `${name}_sum{${labels}} ${metric.value.sum}\n`;
  } else {
    str += `${name}_count ${metric.value.count}\n`;
    str += `${name}_sum ${metric.value.sum}\n`;
  }

  return reduce(metric.value.entries, (result, count, bucket) => {
    if (labels.length > 0) {
      str += `${name}_bucket{${bucketLabel}="${bucket}",${labels}} ${count}\n`;
    } else {
      str += `${name}_bucket{${bucketLabel}="${bucket}"} ${count}\n`;
    }

    return str;
  }, str);
}

export function findExistingMetric<T extends MetricValue>(
  labels?: Labels,
  values: Metric<T>[] = [],
): Metric<T> | undefined {
  // If there are no labels, there can only be one metric
  if (!labels) {
    return values[0];
  }
  return find(values, v => isEqual(v.labels, labels));
}

export function formatCounterOrGauge(name: string, metric: Metric<MetricValue>): string {
  const value = ` ${metric.value.toString()}`;
  // If there are no keys on `metric`, it doesn't have a label;
  // return the count as a string.
  if (metric.labels == null || Object.keys(metric.labels).length === 0) {
    return `${name}${value}\n`;
  }
  const pair = map(metric.labels, (v, k) => `${k}="${v}"`);
  return `${name}{${pair.join(',')}}${value}\n`;
}
