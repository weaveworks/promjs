import { Counter } from './counter';
import { Gauge } from './gauge';
import { Registry } from './registry';
import { Histogram } from './histogram';

export type CollectorType = 'counter' | 'gauge' | 'histogram';

export type RegistryType = Registry;
export type GaugeType = Gauge;
export type CounterType = Counter;
export type HistogramType = Histogram;

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
