import { HistogramValue, Labels, Metric, MetricValue } from './types';

function getLabelPairs(metric: Metric<MetricValue>): string {
  const pairs = Object.entries(metric.labels || {}).map(([k, v]) => `${k}="${v}"`);
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

  return Object.entries(metric.value.entries).reduce((result, [bucket, count]) => {
    if (labels.length > 0) {
      return `${result}${name}_bucket{${bucketLabel}="${bucket}",${labels}} ${count}\n`;
    }
    return `${result}${name}_bucket{${bucketLabel}="${bucket}"} ${count}\n`;
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
  return values.find((v) => {
    if (!v.labels) {
      return false;
    }
    if (Object.keys(v.labels || {}).length !== Object.keys(labels).length) {
      return false;
    }
    const entries = Object.entries(labels);
    for (let i = 0; i < entries.length; i += 1) {
      const [label, value] = entries[i];
      if (v.labels[label] !== value) {
        return false;
      }
    }
    return true;
  });
}

export function formatCounterOrGauge(name: string, metric: Metric<MetricValue>): string {
  const value = ` ${metric.value.toString()}`;
  // If there are no keys on `metric`, it doesn't have a label;
  // return the count as a string.
  if (metric.labels == null || Object.keys(metric.labels).length === 0) {
    return `${name}${value}\n`;
  }
  const pair = Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`);
  return `${name}{${pair.join(',')}}${value}\n`;
}
