const { test } = require('node:test')
const assert = require('node:assert/strict')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

// Capture the real module class at its SDK boundary; retain real HTTP I/O.
function load() {
	let Module
	const sdk = {
		InstanceBase: class {
			updateStatus(status) {
				this.status = status
			}
			setActionDefinitions(actions) {
				this.actions = actions
			}
			setFeedbackDefinitions(feedbacks) {
				this.feedbacks = feedbacks
			}
			log() {}
		},
		Regex: { IP: 'ip', PORT: 'port' },
		InstanceStatus: { Ok: 'ok' },
		runEntrypoint: (value) => {
			Module = value
		},
	}
	const cache = {}
	function localRequire(name) {
		if (name === '@companion-module/base') return sdk
		if (!name.startsWith('.')) return require(name)
		const file = path.resolve(process.env.CHARACTERWORKS_SOURCE || path.join(__dirname, '..'), `${name}.js`)
		if (cache[file]) return cache[file].exports
		const module = { exports: {} }
		cache[file] = module
		vm.runInThisContext(`(function(require,module,exports){${fs.readFileSync(file, 'utf8')}\n})`, { filename: file })(
			localRequire,
			module,
			module.exports,
		)
		return module.exports
	}
	localRequire('./main')
	return new Module()
}

test('CharacterWorks HTTP actions preserve protocol, literal text, definitions and lifecycle', async (t) => {
	const received = []
	let notify
	const server = http.createServer((req, res) => {
		const chunks = []
		req.on('data', (chunk) => chunks.push(chunk))
		req.on('end', () => {
			const body = Buffer.concat(chunks)
			received.push({ method: req.method, url: req.url, headers: req.headers, body })
			res.end('OK')
			notify()
		})
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	t.after(() => new Promise((resolve) => server.close(resolve)))
	const instance = load()
	const config = { host: '127.0.0.1', port: server.address().port }
	await instance.init(config)
	assert.equal(instance.status, 'ok')
	assert.deepEqual(Object.keys(instance.actions), ['trigger_cw', 'set_text', 'activate_grid'])
	assert.deepEqual(instance.feedbacks, {})
	assert.deepEqual(
		instance.getConfigFields().map((field) => field.id),
		['host', 'port'],
	)
	for (const action of Object.values(instance.actions)) {
		for (const option of action.options) {
			assert.equal(option.useVariables, undefined)
			assert.equal(option.isVisible, undefined)
		}
	}
	async function send(actionId, options, expected) {
		const arrived = new Promise((resolve) => {
			notify = resolve
		})
		await instance.actions[actionId].callback({ actionId, options })
		await arrived
		const request = received.at(-1)
		assert.equal(request.method, 'POST')
		assert.equal(request.url, '/')
		assert.equal(request.headers['content-type'], 'application/json')
		assert.equal(request.headers.authorization, undefined)
		assert.equal(Number(request.headers['content-length']), request.body.length)
		assert.deepEqual(JSON.parse(request.body), expected)
	}
	for (const action of ['play_motions', 'stop_motions', 'finish_motions', 'pause_motions']) {
		for (const channel of ['preview', 'live1', 'live2']) {
			await send(
				'trigger_cw',
				{ action_dropdown: action, motion_name: ' intro , lower_third ', channel_dropdown: channel },
				{ action, motions: ['intro', 'lower_third'], channel },
			)
		}
	}
	// These fields have never enabled variables. The host leaves tokens literal.
	const value = 'Grüße 🎬 "quoted"\n$(custom:title)'
	await send(
		'set_text',
		{ motion_name: 'intro', text_layer: 'Title', text_value: value, channel_dropdown: 'live2' },
		{ action: 'set_text', layer: 'intro\\Title', value, channel: 'live2' },
	)
	await send(
		'activate_grid',
		{ grid_name: 'My Grid', grid_cell: '12,3' },
		{ action: 'activate_grid_cell', grid: 'My Grid', cell: [12, 3] },
	)
	await instance.configUpdated({ ...config, host: 'localhost' })
	assert.equal(instance.config.host, 'localhost')
	await instance.configUpdated(config)
	await send(
		'activate_grid',
		{ grid_name: 'Reload', grid_cell: '0,0' },
		{ action: 'activate_grid_cell', grid: 'Reload', cell: [0, 0] },
	)
	await instance.destroy()
})
