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
					const query = this.getNodeParameter('query', i) as string;

					const client = new vertica.Client(connectionConfig);
					await client.connect();
					const result = await client.query(query);

					if (result.rows && result.rows.length > 0) {
						for (const row of result.rows) {
							returnData.push({
								json: row,
								pairedItem: { item: i },
							});
						}
					} else {
						returnData.push({
							json: { success: true, affectedRows: result.rowCount || 0 },
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
