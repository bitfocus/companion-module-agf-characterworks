const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const http = require('http')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Characterworks IP Address',
				tooltip: 'The IP of the Characterworks Server',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Characterworks Port Number (default 5201)',
				tooltip: 'The Port Number that Characterworks is listening on.',
				width: 6,
				default: 5201,
				regex: Regex.PORT,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	executeAction = (action) => {
		var self = this
		var url = 'http://' + self.config.host + ':' + self.config.port

		switch (action.actionId) {
			case 'trigger_cw':
				// create JSON data to HTTP POST to CW
				var requestJSON = {
					action: action.options.action_dropdown,
					motions: [action.options.motion_name],
					channel: action.options.channel_dropdown,
				}
				break

			case 'set_text':
				// create JSON data to HTTP POST to CW
				var requestJSON = {
					action: 'set_text',
					layer: action.options.motion_name + '\\' + action.options.text_layer,
					value: action.options.text_value,
					channel: action.options.channel_dropdown,
				}
				break

			case 'activate_grid':
				// Put row and column into an array of integers
				var data = action.options.grid_cell.split(',')
				var cw_gridrow = parseInt(data[0])
				var cw_gridcolumn = parseInt(data[1])
				var cw_cell_array = [cw_gridrow, cw_gridcolumn]

				// create JSON data to HTTP Post to CW
				var requestJSON = {
					action: 'activate_grid_cell',
					grid: action.options.grid_name,
					cell: cw_cell_array,
				}
				break
		}

		var postData = JSON.stringify(requestJSON)
		// Compile the http request to be made
		var requestData = {
			host: self.config.host,
			path: '/',
			port: self.config.port,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(postData),
			},
		}

		var buffer = ''

		// Make the HTTP request
		var req = http.request(requestData, function (res) {
			console.log(res.statusCode)
			var buffer = ''
			res.on('data', function (data) {
				buffer = buffer + data
			})
			res.on('end', function (data) {
				console.log(buffer)
			})
		})

		req.on('error', function (e) {
			console.log('Problem with request: ' + e.message)
		})

		req.write(postData)
		req.end()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
