import { INodeProperties } from 'n8n-workflow';

export const SpeechSynthesisOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['speechSynthesis'] } },
		options: [
			{ name: '语音合成 (流式/同步)', value: 'textToSpeech', action: '语音合成' },
			{ name: '长文本语音合成', value: 'longTextToSpeech', action: '长文本语音合成' },
		],
		default: 'textToSpeech',
	},
];

export const SpeechSynthesisFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: { show: { resource: ['speechSynthesis'] } },
		options: [
			{ name: 'CosyVoice (实时/高音质)', value: 'cosyvoice-v1' },
			{ name: 'Sambert (经典)', value: 'sambert-v1' },
			{ name: 'Qwen-TTS (大模型驱动)', value: 'qwen-tts-v1' },
			{ name: 'Qwen-TTS-Realtime', value: 'qwen-tts-realtime-v1' },
		],
		default: 'cosyvoice-v1',
	},
	{
		displayName: '输入文本',
		name: 'input',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['speechSynthesis'] } },
	},
	{
		displayName: '音色 (Voice)',
		name: 'voice',
		type: 'string',
		default: 'anna',
		placeholder: '例如: anna, longxiaochun, loongstella',
		displayOptions: { show: { resource: ['speechSynthesis'] } },
	},
	{
		displayName: '高级参数',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加参数',
		default: {},
		displayOptions: { show: { resource: ['speechSynthesis'] } },
		options: [
			{ displayName: '采样率', name: 'sample_rate', type: 'number', default: 16000 },
			{ displayName: '音调', name: 'pitch', type: 'number', default: 1.0, description: '范围 0.5 到 2.0' },
			{ displayName: '音量', name: 'volume', type: 'number', default: 50, description: '范围 0 到 100' },
			{ displayName: '音频格式', name: 'format', type: 'options', options: [{name:'MP3',value:'mp3'},{name:'WAV',value:'wav'},{name:'PCM',value:'pcm'}], default: 'mp3' },
			{ displayName: '语速', name: 'rate', type: 'number', default: 1.0, description: '范围 0.5 到 2.0' },
		],
	},
];
