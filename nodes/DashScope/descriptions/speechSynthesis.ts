import { INodeProperties } from 'n8n-workflow';

export const SpeechSynthesisOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['speechSynthesis'],
			},
		},
		options: [
			{
				name: '文本转语音',
				value: 'textToSpeech',
				description: '将文本转换为语音',
				action: '文本转语音',
			},
		],
		default: 'textToSpeech',
	},
];

export const SpeechSynthesisFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		options: [
			{
				name: 'CosyVoice v1',
				value: 'cosyvoice-v1',
			},
			{
				name: 'Sambert-Zhichu v1',
				value: 'sambert-zhichu-v1',
			},
		],
		default: 'cosyvoice-v1',
		description: '要使用的模型',
		displayOptions: {
			show: {
				resource: ['speechSynthesis'],
				operation: ['textToSpeech'],
			},
		},
		required: true,
	},
	{
		displayName: '输入文本',
		name: 'input',
		type: 'string',
		default: '',
		placeholder: '请输入要转换为语音的文本',
		description: '要转换的文本',
		displayOptions: {
			show: {
				resource: ['speechSynthesis'],
				operation: ['textToSpeech'],
			},
		},
		required: true,
	},
	{
		displayName: '音色 (Voice)',
		name: 'voice',
		type: 'string',
		default: 'anna',
		placeholder: '例如：anna, longxiaochun',
		description: '选择合成语音的音色',
		displayOptions: {
			show: {
				resource: ['speechSynthesis'],
				operation: ['textToSpeech'],
			},
		},
	},
	{
		displayName: '高级选项',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加选项',
		default: {},
		displayOptions: {
			show: {
				resource: ['speechSynthesis'],
				operation: ['textToSpeech'],
			},
		},
		options: [
			{
				displayName: '音频格式',
				name: 'format',
				type: 'options',
				options: [
					{ name: 'WAV', value: 'wav' },
					{ name: 'MP3', value: 'mp3' },
					{ name: 'PCM', value: 'pcm' },
				],
				default: 'mp3',
				description: '合成音频的格式',
			},
			{
				displayName: '采样率',
				name: 'sample_rate',
				type: 'number',
				default: 16000,
				description: '合成音频的采样率，例如 8000, 16000, 22050, 24000, 44100, 48000',
			},
			{
				displayName: '语速',
				name: 'speech_rate',
				type: 'number',
				default: 1,
				description: '语速，范围通常在 0.5 到 2.0 之间',
			},
			{
				displayName: '音调',
				name: 'pitch_rate',
				type: 'number',
				default: 1,
				description: '音调，范围通常在 0.5 到 2.0 之间',
			},
		],
	},
];
