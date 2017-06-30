import { zipObject, has, each, reduce, find, valuesIn } from 'lodash';

import { formatHistogram, formatCounterOrGauge, formatSummary } from './utils';
import Counter from './counter';
import Gauge from './gauge';
import Histogram from './histogram';
import Summary from './summary';

export default class Registry {
  constructor() {
    // initialize an empty object on every metric type
    this.data = zipObject(['counter', 'gauge', 'histogram', 'summary'], [{}, {}, {}, {}]);
  }

  create(type, name, help, options) {
    // check args
    if (!type || !name) {
      throw new Error('A metric type and metric name is required');
    }
    // check for name collisions
    if (has(this.data, `${type}.${name}`)) {
      throw new Error(`A metric with the name '${name}' already exists for type '${type}'`);
    }
    switch (type) {
      case 'counter':
        this.data.counter[name] = {
          type,
          help,
          instance: new Counter()
        };
        return this.data.counter[name].instance;
      case 'gauge':
        this.data.gauge[name] = {
          type,
          help,
          instance: new Gauge()
        };
        return this.data.gauge[name].instance;
      case 'histogram':
        this.data.histogram[name] = {
          type,
          help,
          instance: new Histogram(options)
        };
        return this.data.histogram[name].instance;
      case 'summary':
      this.data.summary[name] = {
        type,
        help,
        instance: new Summary(options)
      };
      return this.data.summary[name].instance;
      default:
        throw new Error('No metric type specified.');
    }
  }

  metrics() {
    // Returns a string in the prometheus' desired format
    // More info: https://prometheus.io/docs/concepts/data_model/
    // Loop through each metric type (counter, histogram, etc);
    return reduce(this.data, (output, metrics, type) => {
      // For each saved metric, create a help and type entry.
      output += reduce(metrics, (result, metric, name) => {
        const values = metric.instance.collect();
        if (metric.help) {
          result += `# HELP ${name} ${metric.help}\n`;
        }
        result += `# TYPE ${name} ${type}\n`;
        // Each metric can have many labels. Iterate over each and append to the string.
        result += reduce(values, (str, value) => {

          if (type === 'counter' || type === 'gauge') {
            str += formatCounterOrGauge(name, value);
          }else if (type === 'histogram') {
            str += formatHistogram(name, value);
          }else {
            str += formatSummary(name, value, 'quantile', '');
          }

          return str;
        }, '');
        return result;
      }, '');
      return output;
    }, '');
  }

  clear() {
    each(this.data, (metrics) => {
      each(metrics, ({ instance }) => {
        instance.resetAll();
      });
    });
    return this;
  }

  get(name) {
    const metric = find(valuesIn(this.data), v => has(v, name));
    return metric ? metric[name].instance : null;
  }
}
