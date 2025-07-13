import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class VerticaDbApi implements ICredentialType {
	name = 'verticaDbApi';
	displayName = 'Vertica Database API';
	documentationUrl =
		'https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: '',
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				host: '={{$credentials.host}}',
				port: '={{$credentials.port}}',
				database: '={{$credentials.database}}',
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};
}
