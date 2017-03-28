### Todos
1. ~~Render metrics for Summary and Histogram types~~
2. Summary metric type
3. ~~Integration test with all metric types~~
4. Docs

### Other thoughts
* Do a lookup instead of looping over values to find by labels. Need to use objects as keys. Maybe use a 'Map' type?
* ~~Histogram seems uneccesarily complicated~~
* Histogram is stringifying numeric values for keys. There is probably a CS interview question that contains a better way to implement that.
* Should probably use immutable data
* `.set()` is exposed to the public API on all metric types. It doesn't show up in enumerable props, but its in the prototype. That will be a footgun for users, even if its not documented.
* This would be a good candidate to try out `Flow` on
* `registry.render()` bypasses metric validation checks (its a direct 'set')
