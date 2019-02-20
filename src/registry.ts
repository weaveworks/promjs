import { each, has, reduce, valuesIn } from 'lodash';
import { Collector, CounterValue, HistogramValue, Metric } from './collector';
import { Counter } from './counter';
import { Gauge } from './gauge';
import { Histogram } from './histogram';

import { formatCounterOrGauge, formatHistogramOrSummary } from './utils';

export type CollectorType = 'counter' | 'gauge' | 'histogram';

type CollectorForType<T extends CollectorType> =
  T extends 'histogram' ? Histogram :
    T extends 'gauge' ? Gauge :
      T extends 'counter' ? Counter :
        never;

interface RegistryItem<T extends CollectorType> {
  [key: string]: {
    type: T;
    help: string;
    instance: CollectorForType<T>;
  };
}

export class Registry {
  private data: {
    [K in CollectorType]: RegistryItem<K>
  };

  constructor() {
    this.data = {
      counter: {},
      gauge: {},
      histogram: {}
    };
  }

  private validateInput(
    type: CollectorType,
    name: string,
    help?: string,
    buckets?: number[],
  ): void {
    // checks for js runtime
    if (String(name) === '') {
      throw new Error('Metric name cannot be empty');
    }
    if (['counter', 'gauge', 'histogram'].indexOf(type) === -1) {
      throw new Error(`Unknown metric type ${type}`);
    }

    if (typeof help !== 'string' && help != null) {
      throw new Error('help must be string or undefined/null');
    }

    if (has(this.data, `${type}.${name}`)) {
      throw new Error(`A metric with the name '${name}' already exists for type '${type}'`);
    }

    if (!Array.isArray(buckets) && buckets != null) {
      throw new Error('buckets must be array or undefined/null');
    }
  }

  create(type: 'counter', name: string, help?: string): Counter;

  create(type: 'gauge', name: string, help?: string): Gauge;

  create(type: 'histogram', name: string, help?: string, histogramBuckets?: number[]): Histogram;

  create(
    type: CollectorType,
    name: string,
    help: string = '',
    histogramBuckets: number[] = [],
  ): Collector<any> {
    this.validateInput(type, name, help, histogramBuckets);

    let instance;
    if (type === 'counter') {
      instance = new Counter();
      this.data.counter[name] = { help, instance, type };
    } else if (type === 'gauge') {
      instance = new Gauge();
      this.data.gauge[name] = { help, instance, type };
    } else {
      instance = new Histogram(histogramBuckets);
      this.data.histogram[name] = { help, instance, type };
    }

    return instance;
  }

  /**
   * Returns a string in the prometheus' desired format
   * More info: https://prometheus.io/docs/concepts/data_model/
   * Loop through each metric type (counter, histogram, etc);
   *
   * @return {string}
   */
  metrics(): string {
    return reduce(this.data,
      (output, metrics, type) => output + reduce(metrics, (src, metric, name) => {
        const values = metric.instance.collect();
        let result = src;
        if (metric.help.length > 0) {
          result += `# HELP ${name} ${metric.help}\n`;
        }
        result += `# TYPE ${name} ${type}\n`;
        // Each metric can have many labels. Iterate over each and append to the string.
        result += reduce(values, (str, value) => {
          const formatted = type === 'histogram'
            ? formatHistogramOrSummary(name, value as Metric<HistogramValue>)
            : formatCounterOrGauge(name, value as Metric<CounterValue>);
          return str + formatted;
        }, '');
        return result;
      }, ''),
      '');
  }

  reset(): this {
    each(this.data, (metrics) => {
      each(metrics, ({ instance }) => {
        instance.resetAll();
      });
    });
    return this;
  }

  clear(): this {
    this.data = {
      counter: {},
      gauge: {},
      histogram: {},
    };

    return this;
  }

  get(type: 'counter', name: string): Counter | undefined;

  get(type: 'gauge', name: string): Gauge | undefined;

  get(type: 'histogram', name: string): Histogram | undefined;

  get(type: CollectorType, name: string): Collector<any> | undefined {
    const registryItems = type != null ? [this.data[type]] : valuesIn(this.data);
    const metric = registryItems.find(v => has(v, name));

    return metric != null ? metric[name].instance : undefined;
  }
}
