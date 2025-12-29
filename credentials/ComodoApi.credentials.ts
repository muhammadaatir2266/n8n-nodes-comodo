import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ComodoApi implements ICredentialType {
	name = 'comodoApi';
	displayName = 'Comodo Endpoint Manager API';
	documentationUrl = 'https://www.xcitium.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API token for Comodo Endpoint Manager (C1 Token)',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'US',
					value: 'itsm-us1',
				},
				{
					name: 'EU',
					value: 'itsm-eu1',
				},
			],
			default: 'itsm-us1',
			required: true,
			description: 'The region of your Comodo Endpoint Manager instance',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=CONESSO {{$credentials.apiToken}}',
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://api-gw.{{$credentials.region}}.comodo.com',
			url: '/api/v2/itsm/statistics/device/summary',
			method: 'GET',
		},
	};
}





