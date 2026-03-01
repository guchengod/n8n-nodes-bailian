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
						name: '图像生成',
						value: 'textToImage',
					},
					{
						name: '视频生成',
						value: 'textToVideo',
					},
					{
						name: '语音合成',
						value: 'speechSynthesis',
					},
					{
						name: '语音识别',
						value: 'speechRecognition',
					},
					{
						name: '语音翻译',
						value: 'speechTranslation',
					},
					{
						name: '任务结果',
						value: 'taskResult',
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
			...TaskResultOperations,
			...TaskResultFields,
		]
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
					let requestBody: IDataObject = {
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
						
						// 根据模型选择不同的端点
						if (model.includes('wanx2.1-t2i-edit')) {
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
							// 默认通用编辑端点
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
							requestBody.input = { top_garment_url: baseImageUrl }; // 示例：以上衣为原图
						} else {
							submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';
							const baseImageUrl = this.getNodeParameter('baseImageUrl', i, '') as string;
							const prompt = this.getNodeParameter('prompt', i, '') as string;
							requestBody.input = { base_image_url: baseImageUrl, prompt };
						}
					}

					// 添加高级选项
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
					if (Object.keys(additionalOptions).length > 0 && requestBody.parameters) {
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
				// 文本生成视频
				if (operation === 'create') {
					for (let i = 0; i < items.length; i++) {
						// 获取参数
						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						
						// 构造请求体
						const requestBody: IDataObject = {
							model,
							input: {
								prompt,
							},
							parameters: {}
						};

						// 如果是图生视频，添加图片URL
						if (model === 'wanx-v2-i2v') {
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;
							(requestBody.input as IDataObject).image_url = imageUrl;
						}

						// 添加负面提示词
						if (negativePrompt) {
							(requestBody.input as IDataObject).negative_prompt = negativePrompt;
						}

						// 添加高级选项
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						if (Object.keys(additionalOptions).length > 0 && requestBody.parameters) {
							Object.assign(requestBody.parameters as IDataObject, additionalOptions);
						}

						// 发送请求
						const response = await axios({
							method: 'POST',
							url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2video/generation',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${apiKey}`
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
								const taskId = outputData.task_id as string;
								
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
				}
			} else if (resource === 'speechSynthesis') {
				// 语音合成
				if (operation === 'textToSpeech') {
					for (let i = 0; i < items.length; i++) {
						const model = this.getNodeParameter('model', i) as string;
						const input = this.getNodeParameter('input', i) as string;
						const voice = this.getNodeParameter('voice', i, 'anna') as string;
						
						const requestBody: IDataObject = {
							model,
							input: {
								text: input,
							},
							parameters: {
								voice,
							}
						};

						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						if (Object.keys(additionalOptions).length > 0 && requestBody.parameters) {
							Object.assign(requestBody.parameters as IDataObject, additionalOptions);
						}

						const response = await axios({
							method: 'POST',
							url: 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/text-to-speech',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${apiKey}`,
								// 如果需要流式或者特定格式，可能需要设置 X-DashScope-SSE
							},
							data: requestBody,
							responseType: 'arraybuffer',
						});

						// 检查是否是 JSON (错误信息) 还是音频流
						const contentType = response.headers['content-type'];
						if (contentType && contentType.includes('application/json')) {
							const result = JSON.parse(Buffer.from(response.data as any).toString());
							returnData.push({ json: result });
						} else {
							// 处理二进制音频数据
							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(response.data as any),
								`tts-${Date.now()}.${(requestBody.parameters as IDataObject).format || 'mp3'}`,
								contentType
							);
							returnData.push({
								json: {
									success: true,
								},
								binary: {
									data: binaryData,
								},
							});
						}
					}
				}
			} else if (resource === 'speechRecognition') {
				// 语音识别 (文件转写)
				if (operation === 'transcription') {
					for (let i = 0; i < items.length; i++) {
						const model = this.getNodeParameter('model', i) as string;
						const fileUrl = this.getNodeParameter('fileUrl', i) as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						
						const requestBody: IDataObject = {
							model,
							input: {
								file_urls: [fileUrl],
							},
							parameters: {}
						};

						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						if (Object.keys(additionalOptions).length > 0 && requestBody.parameters) {
							Object.assign(requestBody.parameters as IDataObject, additionalOptions);
						}

						const response = await axios({
							method: 'POST',
							url: 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${apiKey}`,
								'X-DashScope-Async': 'enable',
							},
							data: requestBody,
						});

						let result = response.data as IDataObject;

						if (waitingForTask && result.output) {
							const outputData = result.output as IDataObject;
							if (outputData && typeof outputData.task_id === 'string') {
								const interval = this.getNodeParameter('interval', i, 2000) as number;
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
				}
			} else if (resource === 'speechTranslation') {
				// 语音翻译
				if (operation === 'translate') {
					for (let i = 0; i < items.length; i++) {
						const model = this.getNodeParameter('model', i) as string;
						const fileUrl = this.getNodeParameter('fileUrl', i) as string;
						const sourceLanguage = this.getNodeParameter('sourceLanguage', i, 'zh') as string;
						const targetLanguage = this.getNodeParameter('targetLanguage', i, 'en') as string;
						
						// 使用 Qwen-Audio 或类似接口
						const requestBody: IDataObject = {
							model,
							input: {
								messages: [
									{
										role: 'user',
										content: [
											{ audio: fileUrl },
											{ text: `请将这段语音从${sourceLanguage}翻译为${targetLanguage}` }
										]
									}
								]
							}
						};

						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						if (Object.keys(additionalOptions).length > 0) {
							Object.assign(requestBody, additionalOptions);
						}

						const response = await axios({
							method: 'POST',
							url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${apiKey}`
							},
							data: requestBody,
						});

						returnData.push({
							json: response.data,
						});
					}
				}
			} else if (resource === 'taskResult') {
				// 查询任务结果
				if (operation === 'queryImageTask' || operation === 'queryVideoTask' || operation === 'querySpeechTask') {
					for (let i = 0; i < items.length; i++) {
						// 获取参数
						const taskId = this.getNodeParameter('taskId', i) as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						const continueOnFail = this.getNodeParameter('continueOnFail', i, true) as boolean;
						
						try {
							// 发送请求
							const response = await axios({
								method: 'GET',
								url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${apiKey}`
								},
							});

							// 处理响应
							let result = response.data as IDataObject;
							
							// 如果需要轮询任务结果
							if (waitingForTask && result.output) {
								const outputData = result.output as IDataObject;
								if (outputData && typeof outputData.task_id === 'string') {
									if (outputData && outputData.task_status !== 'SUCCEEDED' && outputData.task_status !== 'FAILED') {
										const interval = this.getNodeParameter('interval', i, 2000) as number;
										const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 300) as number;
										const taskId = outputData.task_id as string;
										
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
							}

							returnData.push({
								json: result,
							});
						} catch (error) {
							if (continueOnFail) {
								returnData.push({
									json: {
										error: error.message,
										taskId
									}
								});
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
