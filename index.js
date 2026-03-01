module.exports = {
	nodes: [
		// DashScope 统一节点
		require('./dist/nodes/DashScope/DashScope.node.js').DashScope,
	],
	credentials: [
		// DashScope凭证
		require('./dist/credentials/DashScopeApi.credentials.js').DashScopeApi,
	],
};
