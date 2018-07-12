export = PromJs;

declare namespace PromJs {
  /**
   * The Registry is used for creating and storing new Collectors (metrics).
   * Once created, a collector can be retrieved from the registry by it's name.
   *
   * Ensures there are no two different metrics with the same name and type.
   * Exports all metric data in Prometheus format.
   */
  export class Registry {
    constructor();

    /**
     * Creates and returns a new Collector instance.
     * @param  {String}        collectorType    The type of collector to be created.
     * @param  {string}        name             Name of the collector.
     * @param  {string}        help             Description of the collector.
     * @param  {Array<number>} histogramBuckets If the created collector is a histogram, buckets for
     *                                          the histogram.
     *
     * @throws {Error} if type or name are unspecified or a collector with that name and type
     *                 already exists in the registry.
     * @return {Collector}
     */
    create(collectorType: "counter" | "gauge" | "histogram", name: string, help?: string,
        histogramBuckets?: Array<number>): Collector;

    /**
     * @return {string} Metrics in Prometheus format. Ready to be scraped by Prometheus or sent to
     *                  an aggregation gateway.
     */
    metrics(): string;

    /**
     * Resets all collector instances in the registry.
     * @return {Registry} self
     */
    clear(): Registry;

    /**
     * Returns a collector instance by specified collector name.
     * @param  {string}    name collector name
     * @return {Collector}
     */
    get(name: string): Collector;
  }

  /**
   * Class defining a Collector instance.
   * A collector can store and return data based on labels.
   */
  export class Collector {
    constructor();

    /**
     * Stores the value as a data node for the selected labels.
     * Example:
     *   set(3, {a: 1, b: 2})
     * @return {Collector} self
     */
    set(value: number, labels?: object): Collector;

    /**
     * Returns a data node for a label.
     * Example:
     *   set(1)
     *   set(3, {a: 1, b: 2})
     *   get()                 # {value: 1}
     *   get({a: 1, b: 2})     # {a: 1, b: 2, value: 3}
     */
    get(labels?: object): object;

    /**
     * Returns an array of data nodes that partially match the labels.
     * Example:
     *   set(1)
     *   set(3, {a: 1, b: 2})
     *   set(8, {a: 1, b: 5})
     *   collect()             # [{value: 1}, {a: 1, b: 2, value: 3}]
     *   collect({b: 1})       # []
     *   collect({b: 2})       # [{a: 1, b: 2, value: 3}]
     *   collect({a: 1})       # [{a: 1, b: 2, value: 3}, {a: 1, b: 5, value: 8}]
     */
    collect(labels?: object): object;

    /**
     * Deletes all data nodes.
     * @return {Collector} self
     */
    clearAll(): Collector;
  }

  export class Counter extends Collector {
    /**
     * Increments the value of the data node for the label by 1.
     * @return {Counter} self
     */
    inc(labels?: object): Counter;

    /**
     * Adds the amount to the value of the data node for the label.
     * @throws {Error} if the amount is not a number or a number less than 0.
     * @return {Counter} self
     */
    add(amount: number, labels?: object): Counter;

    /**
     * Sets the value of the data node for the label to 0.
     * @return {Counter} self
     */
    reset(labels?: object): Counter;

    /**
     * Set the value of all data nodes to 0.
     * @return {Counter} self
     */
    resetAll(): Counter;
  }

  export class Gauge extends Collector {
    /**
     * Increments the value of the data node for the label by 1.
     * @return {Gauge} self
     */
    inc(labels?: object): Gauge;

    /**
     * Decrements the value of the data node for the label by 1. If the value was 0, it's not
     * changed.
     * @return {Gauge} self
     */
    dec(labels?: object): Gauge;

    /**
     * Adds the amount to the value of the data node for the label.
     * @return {Gauge} self
     */
    add(amount: number, labels?: object): Gauge;

    /**
     * Subtracts the amount from the value of the data node for the label.
     * If the value was 0, it's not changed.
     * @return {Gauge} self
     */
    sub(amount: number, labels?: object): Gauge;

    /**
     * Sets the value of the data node for the label to 0.
     * @return {Gauge} self
     */
    reset(labels?: object): Gauge;

    /**
     * Set the value of all data nodes to 0.
     * @return {Gauge} self
     */
    resetAll(): Gauge;
  }

  export class Histogram extends Collector {
    constructor(buckets: Array<number>);

    /**
     * Observes a value with the labels
     * @return {Histogram} self
     */
    observe(value: number, labels?: object): Histogram;

    /**
     * Resets the buckets for the label to their initial state.
     * @return {Gauge} self
     */
    reset(labels?: object): Histogram;

    /**
     * Resets all buckets.
     * @return {Gauge} self
     */
    resetAll(): Histogram;
  }
}


