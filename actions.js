module.exports = function (self) {
	self.setActionDefinitions({
		trigger_cw: {
			name: 'Trigger CharacterWorks',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'action_dropdown',
					default: 'play_motions',
					choices: [
						{ id: 'play_motions', label: 'play_motions' },
						{ id: 'stop_motions', label: 'stop_motions' },
						{ id: 'finish_motions', label: 'finish_motions' },
					],
				},
				{
					type: 'textinput',
					label: 'Motion Name',
					id: 'motion_name',
					regex: '/^[A-Za-z0-9_-]*$/',
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel_dropdown',
					default: 'preview',
					choices: [
						{ id: 'live1', label: 'live1' },
						{ id: 'live2', label: 'live2' },
						{ id: 'preview', label: 'preview' },
					],
				},
			],
			callback: async (event) => {
				console.log('sending trigger_cw command')
				self.executeAction(event)
			},
		},
		set_text: {
			name: 'Set Text',
			options: [
				{
					type: 'textinput',
					label: 'Motion Name',
					id: 'motion_name',
					width: 12,
					regex: '/^[A-Za-z0-9_-]*$/',
				},
				{
					type: 'textinput',
					label: 'Text Layer',
					id: 'text_layer',
					width: 12,
					default: 'CW text layer variable to replace',
				},
				{
					type: 'textinput',
					label: 'Text Value',
					id: 'text_value',
					width: 12,
					default: 'Sample Text',
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel_dropdown',
					default: 'preview',
					choices: [
						{ id: 'live1', label: 'live1' },
						{ id: 'live2', label: 'live2' },
						{ id: 'preview', label: 'preview' },
					],
				},
			],
			callback: async (event) => {
				console.log('sending set_text command')
				self.executeAction(event)
			},
		},
		activate_grid: {
			name: 'Grid Button',
			options: [
				{
					type: 'textinput',
					label: 'Grid Name',
					id: 'grid_name',
					width: 12,
				},
				{
					type: 'textinput',
					label: 'Grid Cell Coordinates (x,y)',
					id: 'grid_cell',
					default: '0,0',
					regex: '/^\\d+,\\d+$/',
				},
			],
			callback: async (event) => {
				console.log('sending activate_grid command')
				self.executeAction(event)
			},
		},
	})
}
