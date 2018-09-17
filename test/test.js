const SuperWorker = require('../lib/super-worker.js')

//模拟网络请求
var fetch = function(url, options) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			//10%几率出错
			if (Math.random() > 0.1) {
				resolve(url)
			} else {
				reject(url)
			}
		}, 3000 * Math.random())
	})
}

var superWorker = new SuperWorker(fetch, 100, 3)
superWorker.fetch = superWorker.addJob

let startTime = new Date()

superWorker.on('finished', () => {
	let endTime = new Date()
	console.log('cost:', endTime - startTime, 'ms')
})

superWorker.on('retry', (job) => {
	console.log('【retry】', job.args, job.retry)
})

for (var i = 1; i < 200; i++) {
	superWorker.fetch('http://example.com/page/' + i, {
		method: 'GET'
	}).then(ret => {
		console.log(ret)
	}).catch(err => {
		console.log('【error】', err)
	})
}