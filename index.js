module.exports = {
	nodes: [
		// DashScope节点
		require('./nodes/DashScope/DashScopeTextToImage.node.js').DashScopeTextToImage,
		require('./nodes/DashScope/DashScopeGetTaskResult.node.js').DashScopeGetTaskResult,
	],
	credentials: [
		// DashScope凭证
		require('./credentials/DashScopeApi.credentials.js').DashScopeApi,
	],
};
