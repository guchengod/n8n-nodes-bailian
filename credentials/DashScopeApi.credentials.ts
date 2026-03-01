import {
	ICredentialType,
	INodeProperties,
	Icon,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class DashScopeApi implements ICredentialType {
	name = 'dashScopeApi';
	displayName = '阿里云 DashScope API';
	documentationUrl = 'https://help.aliyun.com/document_detail/2400305.html';
	icon: Icon = 'file:dashscope.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: '阿里云 DashScope 的 API 密钥',
		},
	];

	test = {
		request: {
			method: 'GET' as IHttpRequestMethods,
			url: 'https://dashscope.aliyuncs.com/api/v1/models',
		},
	};
}
