import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import * as vertica from 'vertica-nodejs';

export class Vertica implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Vertica',
		name: 'vertica',
		icon: 'file:vertica.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Execute SQL queries against Vertica database',
		defaults: {
			name: 'Vertica',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'verticaDbApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Execute Query',
						value: 'executeQuery',
						action: 'Execute a SQL query',
						description: 'Execute a custom SQL query against the Vertica database',
					},
				],
				default: 'executeQuery',
			},
			{
				displayName: 'Query',
				description: 'SQL query to execute against the Vertica database',
				required: true,
				name: 'query',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: 'SELECT * FROM table_name LIMIT 10;',
				placeholder: 'SELECT * FROM table_name WHERE condition;',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('verticaDbApi');

		const connectionConfig = {
			host: credentials.host as string,
			port: credentials.port as number,
			database: credentials.database as string,
			user: credentials.username as string,
			password: credentials.password as string,
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'executeQuery') {
					const client = new vertica.Client(connectionConfig);
					await client.connect();

					const query = this.getNodeParameter('query', i) as string;

					// Split query into multiple queries if it contains multiple statements
					const queries = query.split('--split--');
					let allResults: any[] = [];
					let totalAffectedRows = 0;

					for (const q of queries) {
						const result = await client.query(q);
						if (result.rows && result.rows.length > 0) {
							allResults = allResults.concat(result.rows);
						} else {
							totalAffectedRows += result.rowCount || 0;
						}
					}

					if (allResults.length > 0) {
						for (const row of allResults) {
							returnData.push({
								json: row,
								pairedItem: { item: i },
							});
						}
					} else {
						returnData.push({
							json: { success: true, affectedRows: totalAffectedRows },
							pairedItem: { item: i },
						});
					}

					await client.end();
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}
