import should from 'should';

import Counter from '../src/counter';

describe('Counter', function () {
  let counter;

  beforeEach(() => {
    counter = new Counter();
  });
  it('increments a value', () => {
    counter.inc().collect().should.deepEqual([{
      value: 1
    }]);
  });
  it('adds a value', () => {
    counter.add(5).collect().should.deepEqual([{
      value: 5
    }]);
  });
  it('increments a value with labels', () => {
    counter.inc({ path: '/foo/bar', status: 'fail' });
    counter.collect({ path: '/foo/bar', status: 'fail' }).should.deepEqual([{
      path: '/foo/bar',
      status: 'fail',
      value: 1
    }]);
  });
  it('ensures value is >= 0', () => {
    const inc = counter.add.bind(counter, -5);
    should(inc).throw();
  });
});
