import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DashScopeApi implements ICredentialType {
	name = 'dashScopeApi';
	displayName = '阿里云 DashScope API';
	documentationUrl = 'https://help.aliyun.com/document_detail/2400305.html';

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

	// API 密钥可以通过请求头中的 Authorization: Bearer $DASHSCOPE_API_KEY 验证
}
