// 创建一个主节点，例如 DashScope.node.ts
import { 
	INodeType, 
	INodeTypeDescription, 
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	IDataObject,
	ILoadOptionsFunctions
} from 'n8n-workflow';
import {
	TextToImageFields, 
	TextToImageOperations,
	TextToVideoFields, 
	TextToVideoOperations,
	SpeechSynthesisFields,
	SpeechSynthesisOperations,
	SpeechRecognitionFields,
	SpeechRecognitionOperations,
	SpeechTranslationFields,
	SpeechTranslationOperations,
	VectorFields,
	VectorOperations,
	TaskResultFields, 
	TaskResultOperations
} from './descriptions';
import { pollTaskStatus } from './descriptions/utils';
import axios from 'axios';

export class DashScope implements INodeType {
	description: INodeTypeDescription = {
		displayName: '阿里云百炼',
		name: 'dashScope',
		icon: 'file:dashscope.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: '使用阿里云百炼API',
		defaults: {
			name: '阿里云百炼',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dashScopeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: '资源',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '任务结果',
						value: 'taskResult',
					},
					{
						name: '视频生成',
						value: 'textToVideo',
					},
					{
						name: '图像生成',
						value: 'textToImage',
					},
					{
						name: '向量服务',
						value: 'vectors',
					},
					{
						name: '语音翻译',
						value: 'speechTranslation',
					},
					{
						name: '语音合成',
						value: 'speechSynthesis',
					},
					{
						name: '语音识别',
						value: 'speechRecognition',
					},
				],
				default: 'textToImage',
			},
			// 根据选择的资源动态加载相应的操作和字段
			...TextToImageOperations,
			...TextToImageFields,
			...TextToVideoOperations,
			...TextToVideoFields,
			...SpeechSynthesisOperations,
			...SpeechSynthesisFields,
			...SpeechRecognitionOperations,
			...SpeechRecognitionFields,
			...SpeechTranslationOperations,
			...SpeechTranslationFields,
			...VectorOperations,
			...VectorFields,
			...TaskResultOperations,
			...TaskResultFields,
		],
		usableAsTool: true
	};

	methods = {
		loadOptions: {
			async getOptions() {
				return [];
			}
		},
		listSearch: {
			async search(this: ILoadOptionsFunctions) {
				return { results: [] };
			}
		}
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('dashScopeApi');
		const apiKey = credentials.apiKey as string;

		try {
			// 处理不同的资源和操作
			if (resource === 'textToImage') {
				// 图像相关功能
				for (let i = 0; i < items.length; i++) {
					const model = this.getNodeParameter('model', i) as string;
					const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
					
					let submitUrl = '';
					const requestBody: IDataObject = {
						model,
						input: {},
						parameters: {}
					};

					// --- 接口路径映射 ---
					if (operation === 'create') {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
						const prompt = this.getNodeParameter('prompt', i) as string;
						const n = this.getNodeParameter('n', i, 1) as number;
						const size = this.getNodeParameter('size', i, '1024*1024') as string;
						requestBody.input = { prompt };
						requestBody.parameters = { n, size };
					} else if (operation === 'edit') {
						const prompt = this.getNodeParameter('prompt', i, '') as string;
						const baseImageUrl = this.getNodeParameter('baseImageUrl', i, '') as string;
						
						if (model.includes('wanx2.1-t2i-edit') || model.includes('wanx-edit')) {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';
							requestBody.input = { prompt, base_image_url: baseImageUrl };
						} else if (model === 'wanx-image-outpainting-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-outpainting/generation';
							requestBody.input = { image_url: baseImageUrl };
						} else if (model === 'wanx-background-generation-v2') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/background-generation/generation';
							requestBody.input = { base_image_url: baseImageUrl, prompt };
						} else if (model === 'wanx-image-erasure-completion-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-erasure-completion/generation';
							const maskImageUrl = this.getNodeParameter('maskImageUrl', i, '') as string;
							requestBody.input = { image_url: baseImageUrl, mask_url: maskImageUrl };
						} else if (model === 'wanx-image-local-repaint-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-local-repaint/generation';
							const maskImageUrl = this.getNodeParameter('maskImageUrl', i, '') as string;
							requestBody.input = { image_url: baseImageUrl, mask_url: maskImageUrl, prompt };
						} else {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';
							requestBody.input = { prompt, base_image_url: baseImageUrl };
						}
					} else if (operation === 'special') {
						if (model === 'wordart-texture') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/wordart/texture';
							const textContent = this.getNodeParameter('text_content', i, '') as string;
							const prompt = this.getNodeParameter('prompt', i, '') as string;
							requestBody.input = { 
								text: { text_content: textContent },
								prompt: prompt
							};
						} else if (model === 'outfit-anyone-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/outfit-anyone/generation';
							const baseImageUrl = this.getNodeParameter('baseImageUrl', i, '') as string;
							requestBody.input = { top_garment_url: baseImageUrl };
						} else {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';
							const baseImageUrl = this.getNodeParameter('baseImageUrl', i, '') as string;
							const prompt = this.getNodeParameter('prompt', i, '') as string;
							requestBody.input = { base_image_url: baseImageUrl, prompt };
						}
					}

					// 添加高级选项
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0) {
						Object.assign(requestBody.parameters as IDataObject, additionalOptions);
					}

					// 发送请求
					const response = await axios({
						method: 'POST',
						url: submitUrl,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
							'X-DashScope-Async': 'enable'
						},
						data: requestBody,
					});

					// 处理响应
					let result = response.data as IDataObject;
					
					// 如果需要轮询任务结果
					if (waitingForTask && result.output) {
						const outputData = result.output as IDataObject;
						if (outputData && typeof outputData.task_id === 'string') {
							const interval = this.getNodeParameter('interval', i, 2000) as number;
							const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 300) as number;
							const taskId = outputData.task_id;
							
							try {
								result = await pollTaskStatus(
									taskId,
									'https://dashscope.aliyuncs.com/api/v1/tasks',
									apiKey,
									interval,
									maxWaitTime
								) as IDataObject;
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `轮询任务结果失败: ${error.message}`);
							}
						}
					}

					returnData.push({
						json: result,
					});
				}
			} else if (resource === 'textToVideo') {
				// 视频相关功能
				for (let i = 0; i < items.length; i++) {
					const model = this.getNodeParameter('model', i) as string;
					const operation = this.getNodeParameter('operation', i) as string;
					const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
					
					let submitUrl = '';
					const requestBody: IDataObject = {
						model,
						input: {},
						parameters: {}
					};

					// --- 接口路径映射 ---
					if (operation === 'textToVideo') {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2video/video-synthesis';
						const prompt = this.getNodeParameter('prompt', i, '') as string;
						requestBody.input = { prompt };
					} else if (operation === 'imageToVideo') {
						const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
						const prompt = this.getNodeParameter('prompt', i, '') as string;
						
						if (model === 'wanx-v2-i2v-dual') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis';
							const lastFrameUrl = this.getNodeParameter('lastFrameUrl', i, '') as string;
							requestBody.input = { img_url: imageUrl, last_frame_img_url: lastFrameUrl, prompt };
						} else if (model === 'wanx-v2-reference') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/reference';
							requestBody.input = { ref_img_url: imageUrl, prompt };
						} else if (model === 'wanx-emoji-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/emoji-synthesis';
							requestBody.input = { face_img_url: imageUrl };
						} else if (model === 'wanx-image-to-action-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/action-synthesis';
							requestBody.input = { img_url: imageUrl, prompt };
						} else {
							// 默认首帧图生视频
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis';
							requestBody.input = { img_url: imageUrl, prompt };
						}
					} else if (operation === 'portraitAnimation') {
						const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
						
						if (model === 'animate-anyone-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/animate-anyone/generation';
							const prompt = this.getNodeParameter('prompt', i, '') as string;
							requestBody.input = { ref_img_url: imageUrl, prompt };
						} else if (model === 'emo-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/emo/generation';
							const audioUrl = this.getNodeParameter('audioUrl', i, '') as string;
							requestBody.input = { face_img_url: imageUrl, audio_url: audioUrl };
						} else if (model === 'live-portrait-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/live-portrait/generation';
							const prompt = this.getNodeParameter('prompt', i, '') as string;
							requestBody.input = { face_img_url: imageUrl, prompt };
						} else if (model === 'wanx-digital-human-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/digital-human/generation';
							const audioUrl = this.getNodeParameter('audioUrl', i, '') as string;
							requestBody.input = { face_img_url: imageUrl, audio_url: audioUrl };
						}
					} else if (operation === 'videoEdit') {
						const videoUrl = this.getNodeParameter('videoUrl', i, '') as string;
						
						if (model === 'video-retalk-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-retalk/generation';
							const audioUrl = this.getNodeParameter('audioUrl', i, '') as string;
							requestBody.input = { video_url: videoUrl, audio_url: audioUrl };
						} else if (model === 'wanx-video-face-replace-v1') {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-face-replace/generation';
							const faceImageUrl = this.getNodeParameter('imageUrl', i, '') as string;
							requestBody.input = { video_url: videoUrl, face_img_url: faceImageUrl };
						} else {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-edit/generation';
							const prompt = this.getNodeParameter('prompt', i, '') as string;
							requestBody.input = { video_url: videoUrl, prompt };
						}
					}

					// 添加高级选项
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0) {
						Object.assign(requestBody.parameters as IDataObject, additionalOptions);
					}

					// 发送请求
					const response = await axios({
						method: 'POST',
						url: submitUrl,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
							'X-DashScope-Async': 'enable'
						},
						data: requestBody,
					});

					// 处理响应
					let result = response.data as IDataObject;
					
					// 如果需要轮询任务结果
					if (waitingForTask && result.output) {
						const outputData = result.output as IDataObject;
						if (outputData && typeof outputData.task_id === 'string') {
							const interval = this.getNodeParameter('interval', i, 5000) as number;
							const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 600) as number;
							const taskId = outputData.task_id;
							
							try {
								result = await pollTaskStatus(
									taskId,
									'https://dashscope.aliyuncs.com/api/v1/tasks',
									apiKey,
									interval,
									maxWaitTime
								) as IDataObject;
							} catch (error) {
								throw new NodeOperationError(this.getNode(), `轮询任务结果失败: ${error.message}`);
							}
						}
					}

					returnData.push({
						json: result,
					});
				}
			} else if (resource === 'speechSynthesis') {
				// 语音合成
				for (let i = 0; i < items.length; i++) {
					const model = this.getNodeParameter('model', i) as string;
					const input = this.getNodeParameter('input', i) as string;
					const voice = this.getNodeParameter('voice', i, 'anna') as string;
					
					const requestBody: IDataObject = {
						model,
						input: { text: input },
						parameters: { voice }
					};

					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0) {
						Object.assign(requestBody.parameters as IDataObject, additionalOptions);
					}

					const response = await axios({
						method: 'POST',
						url: 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/text-to-speech',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
						},
						data: requestBody,
						responseType: 'arraybuffer',
					});

					const contentType = response.headers['content-type'];
					if (contentType && contentType.includes('application/json')) {
						const result = JSON.parse(Buffer.from(response.data as Buffer).toString());
						returnData.push({ json: result });
					} else {
						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(response.data as Buffer),
							`tts-${Date.now()}.${(requestBody.parameters as IDataObject).format || 'mp3'}`,
							contentType
						);
						returnData.push({
							json: { success: true },
							binary: { data: binaryData },
						});
					}
				}
			} else if (resource === 'speechRecognition') {
				// 语音识别
				const operation = this.getNodeParameter('operation', 0) as string;
				for (let i = 0; i < items.length; i++) {
					const model = this.getNodeParameter('model', i) as string;
					const fileUrl = this.getNodeParameter('fileUrl', i) as string;
					const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
					
					let submitUrl = '';
					const requestBody: IDataObject = { model, input: {}, parameters: {} };

					if (operation === 'transcription') {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription';
						requestBody.input = { file_urls: [fileUrl] };
						const hotwords = this.getNodeParameter('hotwords', i, '') as string;
						if (hotwords) {
							try { (requestBody.parameters as IDataObject).hotwords = JSON.parse(hotwords); } catch { (requestBody.parameters as IDataObject).hotwords = hotwords; }
						}
					} else {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/recognizer';
						requestBody.input = { audio_url: fileUrl };
					}

					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0) {
						Object.assign(requestBody.parameters as IDataObject, additionalOptions);
					}

					const response = await axios({
						method: 'POST',
						url: submitUrl,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
							'X-DashScope-Async': operation === 'transcription' ? 'enable' : undefined,
						},
						data: requestBody,
					});

					let result = response.data as IDataObject;
					if (operation === 'transcription' && waitingForTask && result.output) {
						const taskId = (result.output as IDataObject).task_id as string;
						result = await pollTaskStatus(taskId, 'https://dashscope.aliyuncs.com/api/v1/tasks', apiKey, 3000, 600) as IDataObject;
					}
					returnData.push({ json: result });
				}
			} else if (resource === 'speechTranslation') {
				// 语音翻译
				for (let i = 0; i < items.length; i++) {
					const model = this.getNodeParameter('model', i) as string;
					const operation = this.getNodeParameter('operation', i) as string;
					const fileUrl = this.getNodeParameter('fileUrl', i) as string;
					const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
					
					let submitUrl = '';
					const requestBody: IDataObject = { model, input: {}, parameters: {} };

					if (operation === 'livetranslate_async') {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/audio/video-translation/translation';
						requestBody.input = { video_url: fileUrl };
						requestBody.parameters = {
							source_language: this.getNodeParameter('sourceLanguage', i, 'zh') as string,
							target_language: this.getNodeParameter('targetLanguage', i, 'en') as string,
						};
					} else {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/audio/speech-translation/translation';
						requestBody.input = { audio_url: fileUrl };
					}

					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0) {
						Object.assign(requestBody.parameters as IDataObject, additionalOptions);
					}

					const response = await axios({
						method: 'POST',
						url: submitUrl,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
							'X-DashScope-Async': operation === 'livetranslate_async' ? 'enable' : undefined,
						},
						data: requestBody,
					});

					let result = response.data as IDataObject;
					if (operation === 'livetranslate_async' && waitingForTask && result.output) {
						const taskId = (result.output as IDataObject).task_id as string;
						result = await pollTaskStatus(taskId, 'https://dashscope.aliyuncs.com/api/v1/tasks', apiKey, 5000, 1200) as IDataObject;
					}
					returnData.push({ json: result });
				}
			} else if (resource === 'vectors') {
				// 向量服务
				for (let i = 0; i < items.length; i++) {
					const model = this.getNodeParameter('model', i) as string;
					const operation = this.getNodeParameter('operation', i) as string;
					
					let submitUrl = '';
					const requestBody: IDataObject = { model, input: {}, parameters: {} };

					if (operation === 'text_embedding') {
						// 使用 OpenAI 兼容模式地址
						submitUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings';
						const texts = this.getNodeParameter('texts', i) as string;
						requestBody.input = texts.split(',').map(s => s.trim());
						requestBody.model = model;
					} else if (operation === 'batch_text_embedding') {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/batch-text-embedding';
						const ossPath = this.getNodeParameter('oss_input_path', i) as string;
						requestBody.input = { url: ossPath };
					} else if (operation === 'multimodal_embedding') {
						submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding';
						const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
						const videoUrl = this.getNodeParameter('videoUrl', i, '') as string;
						const content = this.getNodeParameter('content', i, '') as string;
						requestBody.input = {
							image: imageUrl || undefined,
							video: videoUrl || undefined,
							text: content || undefined,
						};
					}

					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0) {
						Object.assign(requestBody.parameters as IDataObject, additionalOptions);
					}

					const response = await axios({
						method: 'POST',
						url: submitUrl,
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${apiKey}`,
							'X-DashScope-Async': operation === 'batch_text_embedding' ? 'enable' : undefined,
						},
						data: operation === 'text_embedding' ? { model, input: requestBody.input } : requestBody,
					});

					let result = response.data as IDataObject;
					if (operation === 'batch_text_embedding' && result.output) {
						const taskId = (result.output as IDataObject).task_id as string;
						result = await pollTaskStatus(taskId, 'https://dashscope.aliyuncs.com/api/v1/tasks', apiKey, 5000, 600) as IDataObject;
					}
					returnData.push({ json: result });
				}
			} else if (resource === 'taskResult') {
				// 查询任务结果
				const taskOperation = this.getNodeParameter('operation', 0) as string;
				if (['queryImageTask', 'queryVideoTask', 'querySpeechTask', 'queryVectorTask'].includes(taskOperation)) {
					for (let i = 0; i < items.length; i++) {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						const continueOnFail = this.getNodeParameter('continueOnFail', i, true) as boolean;
						
						try {
							const response = await axios({
								method: 'GET',
								url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${apiKey}`
								},
							});

							let result = response.data as IDataObject;
							
							if (waitingForTask && result.output) {
								const outputData = result.output as IDataObject;
								const taskStatus = outputData.task_status as string;
								if (taskStatus !== 'SUCCEEDED' && taskStatus !== 'FAILED' && taskStatus !== 'CANCELED') {
									const interval = this.getNodeParameter('interval', i, 3000) as number;
									const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 600) as number;
									
									try {
										result = await pollTaskStatus(
											taskId,
											'https://dashscope.aliyuncs.com/api/v1/tasks',
											apiKey,
											interval,
											maxWaitTime
										) as IDataObject;
									} catch (error) {
										if (continueOnFail) {
											result.error = error.message;
										} else {
											throw new NodeOperationError(this.getNode(), `轮询任务结果失败: ${error.message}`);
										}
									}
								}
							}

							returnData.push({ json: result });
						} catch (error) {
							if (continueOnFail) {
								returnData.push({ json: { error: error.message, taskId, success: false } });
							} else {
								throw error;
							}
						}
					}
				}
			}

			return [returnData];
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error as Error);
		}
	}
}
