# super-worker
Split a large number of concurrent tasks into execution

## Build Setup

``` bash
# install dependencies
npm install super-worker --save

# node test
cd node_modules/super-worker
npm run test
```

## API

### SuperWorker

- new SuperWorker(promiseFunc, max_job, max_retry, rest)
- addJob(...args)
- addImportantJob(...args)
- on('finished', () => {})
- on('retry', job => {console.log('【retry】', job.args, job.retry)})

## Usage

【example】: What should I do if I want to grab a lot of pagination from a website?
like this? error! 
```js
for (var i = 1; i < 10000; i++) {
    fetch('http://example.com/page/' + i, {
        method: 'GET'
    }).then(ret => {
        console.log(ret)
    }).catch(err => {
        console.log('【error】', err)
    })
}
```
As above, you will cause a large number of requests in an instant, which may cause the other server to go wrong, so that most of the returned results are wrong.

All, below is a correct example.

```js
const SuperWorker = require('super-worker')
const fetch = require('node-fetch')

//request 100 pages at the same time. 
//retry 3 times after fetch error.
//sleep 300ms before performing the next task
var superWorker = new SuperWorker(fetch, 100, 3, 300)
//rename addJob
superWorker.fetch = superWorker.addJob

let startTime = new Date()

superWorker.on('finished', () => {
    let endTime = new Date()
    console.log('cost:', endTime - startTime, 'ms')
})
superWorker.on('retry', (job) => {
    console.log('【retry】', job.args, job.retry)
})

for (var i = 1; i < 10000; i++) {
    superWorker.fetch('http://example.com/page/' + i, {
        method: 'GET'
    }).then(ret => {
        console.log(ret)
    }).catch(err => {
        console.log('【error】', err)
    })
}
```