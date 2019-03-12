var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Companion instance for Characterworks.
 * @author Eddie Wettach <ewettach@gmail.com>
 */


class instance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config);
		var self = this;
		// Characterworks Port #
		self.port = 5201;
		self.actions();
	}

	actions(system) {
		var self = this;
		self.system.emit('instance_actions', self.id, {
            'characterworks': {
				label: 'Trigger CharacterWorks',
				options: [
					{
						type: 'dropdown',
						label: 'Action',
						id: 'action_dropdown',
						default: 'play_motions',
						choices: [
						  { id: 'play_motions', label: 'play_motions' },
						  { id: 'stop_motions', label: 'stop_motions' },
						  { id: 'finish_motions', label: 'finish_motions' }
						]
					  },
					{
						type:  'textinput',
						label: 'Motion Name',
						id:    'motion_name',
						regex: '/^[A-Za-z0-9_\-]*$/'
					},
					{
						type: 'dropdown',
						label: 'Channel',
						id: 'channel_dropdown',
						default: 'preview',
						choices: [
						  { id: 'live1', label: 'live1' },
						  { id: 'live2', label: 'live2' },
						  { id: 'preview', label: 'preview' }
						]
					  }
				]
			}
		});
	}

	action(action) {
		var self = this;
		var url = 'http://' + self.config.host + ':' + self.config.port;
		
        if(action.action=='characterworks'){
			// create http request client
			var request = require("request")

			// create JSON data to HTTP POST to CW
			var requestData = {
				"action": action.options.action_dropdown,
				"motions": [
				action.options.motion_name
				],
				"channel": action.options.channel_dropdown
			}

			// Send the request to Characterworks
			request({
				url: url,
				method: "POST",
				json: requestData
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					console.log(body)
				}
				else {
					self.log("Characterworks Send Error: " + error)
					console.log("response.statusCode: " + response.statusCode)
					console.log("response.statusText: " + response.statusText)
				}
			})
        }
	}
	// Web config fields
	config_fields () {
		var self = this;
		return [
			{
				type:    'textinput',
				id:      'host',
				label:   'Characterworks IP Address',
				tooltip: 'The IP of the Characterworks Server',
				width:   6,
				regex:   self.REGEX_IP
			},
			{
				type:    'textinput',
				id:      'port',
				label:   'Characterworks Port Number (default 5201)',
				tooltip: 'The Port Number that Characterworks is listening on.',
				width:   6,
				default: '5201'
			}
		]
	}


	destroy() {
		var self = this;
		debug("destroy");
	}

	init() {
		var self = this;
		self.status(self.STATE_OK);
		debug = self.debug;
		log = self.log;
	}

	updateConfig(config) {
		var self = this;

		self.config = config;
	}
}

exports = module.exports = instance;
