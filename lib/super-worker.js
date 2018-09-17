class SuperWorker {
	constructor(func, max_job, max_retry, rest) {
		this.func = func //任务流程
		this.jobs = [] //所有任务
		this.MAX_JOB = max_job || 1 //最大能同时做多少个任务
		this.MAX_RETRY = max_retry || 0 //任务失败后最大重试次数
		this.current_job = 0 //当前正在做多少个任务
		this.rest = rest || 0 //完成一个任务后休息多少ms后继续做下一个任务

		this.listener = {}
	}


	//获取一个精力？继续工作：没精力了
	getEnergy() {
		if (this.current_job < this.MAX_JOB) {
			this.current_job++;
			return true
		}
		return false
	}

	//添加一个任务到队列中
	addJob(...args) {
		var self = this
		return new Promise((resolve, reject) => {
			self.jobs.push({
				args,
				retry: 0,
				resolve,
				reject
			})

			if (self.getEnergy()) {
				self.doJob()
			}
		})
	}

	//添加一个优先任务
	addImportantJob(...args) {
		var self = this
		return new Promise((resolve, reject) => {
			self.jobs.unshift({
				args,
				retry: 0,
				resolve,
				reject
			})

			if (self.getEnergy()) {
				self.doJob()
			}
		})
	}

	//从队列中取出一个任务进行工作
	doJob() {
		let job = this.jobs.shift()
		if (job) {
			//完成任务后继续执行下一个任务
			this.func(...job.args).then(ret => {
				job.resolve(ret)
				//是否要休息
				if (this.rest > 0) {
					setTimeout(() => {
						this.doJob()
					}, this.rest)
				} else {
					this.doJob()
				}
			}).catch(err => {
				//是否要重试
				if (job.retry >= this.MAX_RETRY) {
					job.reject(err)
					// this.emit('error', job, err)
				} else {
					job.retry++;
					//retry
					this.jobs.unshift(job)
					this.emit('retry', job)
				}

				//是否要休息
				if (this.rest > 0) {
					setTimeout(() => {
						this.doJob()
					}, this.rest)
				} else {
					this.doJob()
				}

			})
		} else {
			this.current_job--;
			if (this.current_job == 0) {
				//没任务了，休息下吧
				this.emit('finished')
			}
		}
	}


	//a simple emiter
	on(str, func) {
		if (!this.listener[str])
			this.listener[str] = []
		this.listener[str].push(func)
	}
	//a simple emiter
	emit(str, ...args) {
		if (this.listener[str]) {
			this.listener[str].forEach(func => {
				func(...args)
			})
		}
	}
}

module.exports = SuperWorker