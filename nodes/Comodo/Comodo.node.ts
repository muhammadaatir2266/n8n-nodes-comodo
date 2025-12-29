import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class Comodo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Comodo Endpoint Manager',
		name: 'comodo',
		icon: 'file:comodo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Comodo Endpoint Manager (RMM & Antivirus) API',
		defaults: {
			name: 'Comodo',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'comodoApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Device',
						value: 'device',
					},
					{
						name: 'Device Group',
						value: 'deviceGroup',
					},
					{
						name: 'Alert',
						value: 'alert',
					},
					{
						name: 'Monitor',
						value: 'monitor',
					},
					{
						name: 'Security',
						value: 'security',
					},
					{
						name: 'Statistics',
						value: 'statistics',
					},
					{
						name: 'Procedure',
						value: 'procedure',
					},
				],
				default: 'device',
			},

			// ==================== DEVICE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['device'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all devices',
						action: 'Get all devices',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get device summary by ID',
						action: 'Get device summary',
					},
					{
						name: 'Get With CCS Details',
						value: 'getWithCcs',
						description: 'Get devices with Comodo Client Security details',
						action: 'Get devices with CCS details',
					},
					{
						name: 'Get Count',
						value: 'getCount',
						description: 'Get device count by search criteria',
						action: 'Get device count',
					},
					{
						name: 'Reboot',
						value: 'reboot',
						description: 'Send reboot command to devices',
						action: 'Reboot devices',
					},
					{
						name: 'Update AV Database',
						value: 'updateAvDb',
						description: 'Update antivirus database on devices',
						action: 'Update AV database',
					},
					{
						name: 'Update CCS',
						value: 'updateCcs',
						description: 'Update Comodo Client Security on devices',
						action: 'Update CCS',
					},
				],
				default: 'getAll',
			},

			// Device ID for single device operations
			{
				displayName: 'Device ID',
				name: 'deviceId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the device',
			},

			// Device IDs for bulk operations
			{
				displayName: 'Device IDs',
				name: 'deviceIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['reboot', 'updateAvDb', 'updateCcs'],
					},
				},
				default: '',
				description: 'Comma-separated list of device IDs',
			},

			// Reboot options
			{
				displayName: 'Reboot Type',
				name: 'rebootType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['reboot'],
					},
				},
				options: [
					{
						name: 'Immediate',
						value: 1,
					},
					{
						name: 'With Warning',
						value: 2,
					},
				],
				default: 2,
				description: 'Type of reboot to perform',
			},
			{
				displayName: 'Timeout (Seconds)',
				name: 'rebootTimeout',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['reboot'],
						rebootType: [2],
					},
				},
				default: 300,
				description: 'Timeout in seconds before reboot',
			},
			{
				displayName: 'Warning Message',
				name: 'rebootMessage',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['reboot'],
						rebootType: [2],
					},
				},
				default: 'Your device will reboot in 5 minutes because it is required by your administrator',
				description: 'Message to display to user before reboot',
			},

			// ==================== DEVICE GROUP OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['deviceGroup'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all device groups',
						action: 'Get all device groups',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get device group by ID',
						action: 'Get device group',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new device group',
						action: 'Create device group',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a device group',
						action: 'Delete device group',
					},
					{
						name: 'Rename',
						value: 'rename',
						description: 'Rename a device group',
						action: 'Rename device group',
					},
				],
				default: 'getAll',
			},

			// Device Group ID
			{
				displayName: 'Device Group ID',
				name: 'deviceGroupId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['deviceGroup'],
						operation: ['get', 'delete', 'rename'],
					},
				},
				default: '',
				description: 'The ID of the device group',
			},

			// Device Group Name
			{
				displayName: 'Group Name',
				name: 'groupName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['deviceGroup'],
						operation: ['create', 'rename'],
					},
				},
				default: '',
				description: 'Name of the device group',
			},

			// Company ID for device group creation
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['deviceGroup'],
						operation: ['create'],
					},
				},
				default: 1,
				description: 'The company ID for the device group',
			},

			// ==================== ALERT OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['alert'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Search and get all alerts',
						action: 'Get all alerts',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get alert details by ID',
						action: 'Get alert details',
					},
					{
						name: 'Get Logs By Device',
						value: 'getLogsByDevice',
						description: 'Get alert logs for a specific device',
						action: 'Get alert logs by device',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new alert',
						action: 'Create alert',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing alert',
						action: 'Update alert',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete alerts',
						action: 'Delete alerts',
					},
				],
				default: 'getAll',
			},

			// Alert ID
			{
				displayName: 'Alert ID',
				name: 'alertId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['alert'],
						operation: ['get', 'update'],
					},
				},
				default: '',
				description: 'The ID of the alert',
			},

			// Alert IDs for deletion
			{
				displayName: 'Alert IDs',
				name: 'alertIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['alert'],
						operation: ['delete'],
					},
				},
				default: '',
				description: 'Comma-separated list of alert IDs to delete',
			},

			// Alert Name
			{
				displayName: 'Alert Name',
				name: 'alertName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['alert'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the alert',
			},

			// Alert Description
			{
				displayName: 'Alert Description',
				name: 'alertDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['alert'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Description of the alert',
			},

			// ==================== MONITOR OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['monitor'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Search and get all monitors',
						action: 'Get all monitors',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get monitor details by ID',
						action: 'Get monitor details',
					},
					{
						name: 'Get Logs By Device',
						value: 'getLogsByDevice',
						description: 'Get monitoring logs for a specific device',
						action: 'Get monitor logs by device',
					},
					{
						name: 'Get Execution Log Details',
						value: 'getExecutionLogDetails',
						description: 'Get detailed execution logs',
						action: 'Get execution log details',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new monitor',
						action: 'Create monitor',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing monitor',
						action: 'Update monitor',
					},
				],
				default: 'getAll',
			},

			// Monitor ID
			{
				displayName: 'Monitor ID',
				name: 'monitorId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['monitor'],
						operation: ['get', 'update'],
					},
				},
				default: '',
				description: 'The ID of the monitor',
			},

			// Monitor Name
			{
				displayName: 'Monitor Name',
				name: 'monitorName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['monitor'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the monitor',
			},

			// Monitor Description
			{
				displayName: 'Monitor Description',
				name: 'monitorDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['monitor'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Description of the monitor',
			},

			// Monitor Category ID
			{
				displayName: 'Category ID',
				name: 'monitorCategoryId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['monitor'],
						operation: ['create'],
					},
				},
				default: 1,
				description: 'Category ID for the monitor',
			},

			// ==================== SECURITY OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['security'],
					},
				},
				options: [
					{
						name: 'Run Scan',
						value: 'runScan',
						description: 'Run antivirus scan on devices',
						action: 'Run scan on devices',
					},
					{
						name: 'Stop Scan',
						value: 'stopScan',
						description: 'Stop antivirus scan on devices',
						action: 'Stop scan on devices',
					},
					{
						name: 'Quarantine Action',
						value: 'quarantineAction',
						description: 'Delete or restore quarantined file',
						action: 'Quarantine action',
					},
					{
						name: 'Malware Action',
						value: 'malwareAction',
						description: 'Run action on detected malware',
						action: 'Malware action',
					},
				],
				default: 'runScan',
			},

			// Security Device IDs
			{
				displayName: 'Device IDs',
				name: 'securityDeviceIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['security'],
						operation: ['runScan', 'stopScan', 'malwareAction'],
					},
				},
				default: '',
				description: 'Comma-separated list of device IDs',
			},

			// Scan Action Type
			{
				displayName: 'Scan Type',
				name: 'scanType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['security'],
						operation: ['runScan'],
					},
				},
				options: [
					{
						name: 'Quick Scan',
						value: 1,
					},
					{
						name: 'Full Scan',
						value: 2,
					},
				],
				default: 2,
				description: 'Type of scan to run',
			},

			// Malware Action Type
			{
				displayName: 'Malware Action',
				name: 'malwareActionType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['security'],
						operation: ['malwareAction'],
					},
				},
				options: [
					{
						name: 'Quarantine',
						value: 1,
					},
					{
						name: 'Delete',
						value: 2,
					},
					{
						name: 'Ignore',
						value: 3,
					},
					{
						name: 'Report as False Positive',
						value: 4,
					},
					{
						name: 'Clean',
						value: 5,
					},
				],
				default: 5,
				description: 'Action to take on detected malware',
			},

			// Quarantine options
			{
				displayName: 'Device ID',
				name: 'quarantineDeviceId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['security'],
						operation: ['quarantineAction'],
					},
				},
				default: '',
				description: 'Device ID for quarantine action',
			},
			{
				displayName: 'File Hash',
				name: 'quarantineHash',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['security'],
						operation: ['quarantineAction'],
					},
				},
				default: '',
				description: 'SHA1 hash of the quarantined file',
			},
			{
				displayName: 'Quarantine Action',
				name: 'quarantineActionType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['security'],
						operation: ['quarantineAction'],
					},
				},
				options: [
					{
						name: 'Restore',
						value: 1,
					},
					{
						name: 'Delete',
						value: 2,
					},
				],
				default: 2,
				description: 'Action to take on quarantined file',
			},

			// ==================== STATISTICS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['statistics'],
					},
				},
				options: [
					{
						name: 'Get Device Summary',
						value: 'getDeviceSummary',
						description: 'Get summary statistics of all devices',
						action: 'Get device summary statistics',
					},
				],
				default: 'getDeviceSummary',
			},

			// ==================== PROCEDURE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['procedure'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Search and get all procedures',
						action: 'Get all procedures',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get procedure details by ID',
						action: 'Get procedure details',
					},
					{
						name: 'Run',
						value: 'run',
						description: 'Run a procedure on devices',
						action: 'Run procedure',
					},
					{
						name: 'Get Logs By Device',
						value: 'getLogsByDevice',
						description: 'Get procedure logs for a specific device',
						action: 'Get procedure logs by device',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new script procedure',
						action: 'Create procedure',
					},
				],
				default: 'getAll',
			},

			// Procedure ID
			{
				displayName: 'Procedure ID',
				name: 'procedureId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['procedure'],
						operation: ['get', 'run'],
					},
				},
				default: '',
				description: 'The ID of the procedure',
			},

			// Procedure Device IDs
			{
				displayName: 'Device IDs',
				name: 'procedureDeviceIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['procedure'],
						operation: ['run'],
					},
				},
				default: '',
				description: 'Comma-separated list of device IDs to run procedure on',
			},

			// Procedure Name
			{
				displayName: 'Procedure Name',
				name: 'procedureName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['procedure'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the procedure',
			},

			// Procedure Description
			{
				displayName: 'Procedure Description',
				name: 'procedureDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['procedure'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Description of the procedure',
			},

			// ==================== COMMON OPTIONS ====================
			// Device ID for logs operations
			{
				displayName: 'Device ID',
				name: 'logsDeviceId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['alert', 'monitor', 'procedure'],
						operation: ['getLogsByDevice'],
					},
				},
				default: '',
				description: 'The device ID to get logs for',
			},

			// Pagination
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['device', 'deviceGroup', 'alert', 'monitor', 'procedure'],
						operation: ['getAll', 'getWithCcs'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['device', 'deviceGroup', 'alert', 'monitor', 'procedure'],
						operation: ['getAll', 'getWithCcs'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// Additional Filters
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['getAll', 'getWithCcs', 'getCount'],
					},
				},
				options: [
					{
						displayName: 'Company Name',
						name: 'companyName',
						type: 'string',
						default: '',
						description: 'Filter by company name',
					},
					{
						displayName: 'Company IDs',
						name: 'companyIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list of company IDs to filter by',
					},
					{
						displayName: 'Device Name',
						name: 'deviceName',
						type: 'string',
						default: '',
						description: 'Filter by device name (partial match)',
					},
					{
						displayName: 'OS Type',
						name: 'osType',
						type: 'multiOptions',
						options: [
							{ name: 'Windows', value: 1 },
							{ name: 'macOS', value: 2 },
							{ name: 'Linux', value: 3 },
							{ name: 'iOS', value: 4 },
							{ name: 'Android', value: 5 },
						],
						default: [],
						description: 'Filter by operating system type',
					},
					{
						displayName: 'Online Status',
						name: 'onlineStatus',
						type: 'options',
						options: [
							{ name: 'All', value: 0 },
							{ name: 'Online', value: 1 },
							{ name: 'Offline', value: 2 },
						],
						default: 0,
						description: 'Filter by online status',
					},
					{
						displayName: 'Security Client Status',
						name: 'securityClientStatus',
						type: 'multiOptions',
						options: [
							{ name: 'Not Installed', value: 1 },
							{ name: 'Installing', value: 2 },
							{ name: 'Installed', value: 3 },
							{ name: 'Error', value: 4 },
							{ name: 'Running', value: 5 },
						],
						default: [],
						description: 'Filter by security client status',
					},
					{
						displayName: 'Group IDs',
						name: 'groupIds',
						type: 'string',
						default: '',
						description: 'Comma-separated list of group IDs to filter by',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('comodoApi');
		const baseUrl = `https://api-gw.${credentials.region}.comodo.com`;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				// ==================== DEVICE ====================
				if (resource === 'device') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 100 : (this.getNodeParameter('limit', i, 50) as number);
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						if (returnAll) {
							// Paginate through all results
							const allData: IDataObject[] = [];
							let offset = 0;
							const pageSize = 100;
							let hasMore = true;

							while (hasMore) {
								const body = buildSearchBody(additionalFields, pageSize, offset);
								const response = await comodoApiRequest.call(
									this,
									'POST',
									`${baseUrl}/api/v2/itsm/devices/search`,
									body,
								) as IDataObject;

								// Handle response format: $I.data
								let data: IDataObject[] = [];
								if (response.$I && (response.$I as IDataObject).data && Array.isArray((response.$I as IDataObject).data)) {
									data = (response.$I as IDataObject).data as IDataObject[];
								} else if (response.$D && Array.isArray(response.$D)) {
									data = response.$D as IDataObject[];
								} else if (response.data && Array.isArray(response.data)) {
									data = response.data as IDataObject[];
								} else if (Array.isArray(response)) {
									data = response as IDataObject[];
								}
								
								allData.push(...data);

								if (data.length < pageSize) {
									hasMore = false;
								} else {
									offset += pageSize;
								}
							}
							responseData = allData.length > 0 ? allData : [{ message: 'No devices found' }];
						} else {
							const body = buildSearchBody(additionalFields, limit, 0);
							const response = await comodoApiRequest.call(
								this,
								'POST',
								`${baseUrl}/api/v2/itsm/devices/search`,
								body,
							) as IDataObject;
							
							// Handle response format: $I.data
							if (response.$I && (response.$I as IDataObject).data && Array.isArray((response.$I as IDataObject).data)) {
								responseData = (response.$I as IDataObject).data as IDataObject[];
							} else if (response.$D && Array.isArray(response.$D)) {
								responseData = response.$D as IDataObject[];
							} else if (response.data && Array.isArray(response.data)) {
								responseData = response.data as IDataObject[];
							} else {
								responseData = response;
							}
						}
					} else if (operation === 'get') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						responseData = await comodoApiRequest.call(
							this,
							'GET',
							`${baseUrl}/api/v2/itsm/devices/${deviceId}/summary`,
						);
					} else if (operation === 'getWithCcs') {
						// Note: Using /devices/search as it includes CCS details
						// The /load-with-ccs-details endpoint has issues
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 100 : (this.getNodeParameter('limit', i, 50) as number);
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						if (returnAll) {
							// Paginate through all results
							const allData: IDataObject[] = [];
							let offset = 0;
							const pageSize = 100;
							let hasMore = true;

							while (hasMore) {
								const body = buildSearchBody(additionalFields, pageSize, offset);
								const response = await comodoApiRequest.call(
									this,
									'POST',
									`${baseUrl}/api/v2/itsm/devices/search`,
									body,
								) as IDataObject;

								// Handle response format: $I.data
								let data: IDataObject[] = [];
								if (response.$I && (response.$I as IDataObject).data && Array.isArray((response.$I as IDataObject).data)) {
									data = (response.$I as IDataObject).data as IDataObject[];
								} else if (response.$D && Array.isArray(response.$D)) {
									data = response.$D as IDataObject[];
								} else if (response.data && Array.isArray(response.data)) {
									data = response.data as IDataObject[];
								} else if (Array.isArray(response)) {
									data = response as IDataObject[];
								}
								
								allData.push(...data);

								if (data.length < pageSize) {
									hasMore = false;
								} else {
									offset += pageSize;
								}
							}
							responseData = allData.length > 0 ? allData : [{ message: 'No devices found' }];
						} else {
							const body = buildSearchBody(additionalFields, limit, 0);
							const response = await comodoApiRequest.call(
								this,
								'POST',
								`${baseUrl}/api/v2/itsm/devices/search`,
								body,
							) as IDataObject;
							
							// Handle response format: $I.data
							if (response.$I && (response.$I as IDataObject).data && Array.isArray((response.$I as IDataObject).data)) {
								responseData = (response.$I as IDataObject).data as IDataObject[];
							} else if (response.$D && Array.isArray(response.$D)) {
								responseData = response.$D as IDataObject[];
							} else if (response.data && Array.isArray(response.data)) {
								responseData = response.data as IDataObject[];
							} else {
								responseData = response;
							}
						}
					} else if (operation === 'getCount') {
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const body = buildSearchBody(additionalFields, 20, 0);
						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/devices/search/count`,
							body,
						);
					} else if (operation === 'reboot') {
						const deviceIds = (this.getNodeParameter('deviceIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));
						const rebootType = this.getNodeParameter('rebootType', i) as number;

						const body: IDataObject = {
							'$R': {
								deviceIds,
								reboot: {
									type: rebootType,
								},
							},
						};

						if (rebootType === 2) {
							const timeout = this.getNodeParameter('rebootTimeout', i) as number;
							const message = this.getNodeParameter('rebootMessage', i) as string;
							(body['$R'] as IDataObject).reboot = {
								type: rebootType,
								timeout,
								message,
							};
						}

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/devices/reboot`,
							body,
						);
					} else if (operation === 'updateAvDb') {
						const deviceIds = (this.getNodeParameter('deviceIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));

						const body = {
							'$R': {
								devices: deviceIds,
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/devices/update-devices-av-db`,
							body,
						);
					} else if (operation === 'updateCcs') {
						const deviceIds = (this.getNodeParameter('deviceIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));

						const body = {
							'$R': {
								devices: deviceIds,
								reboot: {
									type: 1,
									timeout: 300,
									message: 'Your device will reboot in 5 minutes because it is required by your administrator',
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/devices/update-ccs`,
							body,
						);
					}
				}

				// ==================== DEVICE GROUP ====================
				else if (resource === 'deviceGroup') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 500 : (this.getNodeParameter('limit', i) as number);

						const body = {
							'$O': {
								columns: ['id', 'name', 'added_at', 'owner_id', 'company_id', 'type'],
							},
							'$S': {
								pagination: {
									limit,
									offset: 0,
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/devices-groups/search`,
							body,
						);
					} else if (operation === 'get') {
						const deviceGroupId = this.getNodeParameter('deviceGroupId', i) as string;
						responseData = await comodoApiRequest.call(
							this,
							'GET',
							`${baseUrl}/api/v2/itsm/devices-groups/${deviceGroupId}`,
						);
					} else if (operation === 'create') {
						const groupName = this.getNodeParameter('groupName', i) as string;
						const companyId = this.getNodeParameter('companyId', i) as number;

						const body = {
							'$R': {
								groupData: {
									name: groupName,
									companyId,
								},
								devicesList: [],
							},
							'$O': {
								columns: ['id', 'name'],
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/devices-groups`,
							body,
						);
					} else if (operation === 'delete') {
						const deviceGroupId = this.getNodeParameter('deviceGroupId', i) as string;
						responseData = await comodoApiRequest.call(
							this,
							'DELETE',
							`${baseUrl}/api/v2/itsm/devices-groups/${deviceGroupId}`,
						);
					} else if (operation === 'rename') {
						const deviceGroupId = this.getNodeParameter('deviceGroupId', i) as string;
						const groupName = this.getNodeParameter('groupName', i) as string;

						const body = {
							'$R': {
								name: groupName,
							},
							'$O': {
								columns: ['id', 'name'],
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'PUT',
							`${baseUrl}/api/v2/itsm/devices-groups/${deviceGroupId}`,
							body,
						);
					}
				}

				// ==================== ALERT ====================
				else if (resource === 'alert') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 500 : (this.getNodeParameter('limit', i) as number);

						const body = {
							'$O': {
								columns: ['id', 'name', 'created_by_username', 'created', 'updated_by_username', 'modified'],
							},
							'$S': {
								pagination: {
									limit,
									offset: 0,
								},
								sort: {
									name: 'asc',
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/alerts/search`,
							body,
						);
					} else if (operation === 'get') {
						const alertId = this.getNodeParameter('alertId', i) as string;
						responseData = await comodoApiRequest.call(
							this,
							'GET',
							`${baseUrl}/api/v2/itsm/alerts/${alertId}`,
						);
					} else if (operation === 'getLogsByDevice') {
						const deviceId = this.getNodeParameter('logsDeviceId', i) as string;

						const body = {
							'$O': {
								columns: ['alertId', 'status', 'origin', 'hitCounters'],
							},
							'$S': {
								pagination: {
									limit: 40,
									offset: 0,
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/alerts/logs-by-device/${deviceId}`,
							body,
						);
					} else if (operation === 'create') {
						const alertName = this.getNodeParameter('alertName', i) as string;
						const alertDescription = this.getNodeParameter('alertDescription', i) as string;

						const body = {
							'$R': {
								name: alertName,
								description: alertDescription,
							},
							'$O': {
								columns: ['id', 'name', 'created_by_username', 'created', 'updated_by_username', 'modified'],
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/alerts`,
							body,
						);
					} else if (operation === 'delete') {
						const alertIds = (this.getNodeParameter('alertIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));

						const body = {
							'$R': {
								alertsIds: alertIds,
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/alerts/delete-bulk/`,
							body,
						);
					}
				}

				// ==================== MONITOR ====================
				else if (resource === 'monitor') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 500 : (this.getNodeParameter('limit', i) as number);

						const body = {
							'$O': {
								columns: ['name', 'type', 'profile_count', 'created_by', 'created', 'updated_by', 'modified'],
							},
							'$S': {
								pagination: {
									limit,
									offset: 0,
								},
								sort: {
									name: 'asc',
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/monitors/search`,
							body,
						);
					} else if (operation === 'get') {
						const monitorId = this.getNodeParameter('monitorId', i) as string;
						responseData = await comodoApiRequest.call(
							this,
							'GET',
							`${baseUrl}/api/v2/itsm/monitors/${monitorId}`,
						);
					} else if (operation === 'getLogsByDevice') {
						const deviceId = this.getNodeParameter('logsDeviceId', i) as string;

						const body = {
							'$O': {
								columns: ['monitoring', 'status', 'hitCounters', 'lastHitTime', 'lastUpdateTime'],
							},
							'$S': {
								pagination: {
									limit: 20,
									offset: 0,
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/monitors/logs-by-device/${deviceId}`,
							body,
						);
					} else if (operation === 'create') {
						const monitorName = this.getNodeParameter('monitorName', i) as string;
						const monitorDescription = this.getNodeParameter('monitorDescription', i) as string;
						const categoryId = this.getNodeParameter('monitorCategoryId', i) as number;

						const body = {
							'$O': {
								columns: ['name', 'type', 'profile_count', 'created_by', 'created', 'updated_by', 'modified'],
							},
							'$R': {
								name: monitorName,
								description: monitorDescription,
								category_id: categoryId,
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/monitors`,
							body,
						);
					}
				}

				// ==================== SECURITY ====================
				else if (resource === 'security') {
					if (operation === 'runScan' || operation === 'stopScan') {
						const deviceIds = (this.getNodeParameter('securityDeviceIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));

						const action = operation === 'runScan'
							? (this.getNodeParameter('scanType', i) as number)
							: 0; // 0 = stop

						const body = {
							'$R': {
								devices: deviceIds,
								action,
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/security/manage/scan-actions-devices`,
							body,
						);
					} else if (operation === 'quarantineAction') {
						const deviceId = parseInt(this.getNodeParameter('quarantineDeviceId', i) as string, 10);
						const hash = this.getNodeParameter('quarantineHash', i) as string;
						const actionType = this.getNodeParameter('quarantineActionType', i) as number;

						const body = {
							'$R': {
								deviceId,
								hash,
								actionType,
								path: 'string',
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/security/manage/quarantine-action`,
							body,
						);
					} else if (operation === 'malwareAction') {
						const deviceIds = (this.getNodeParameter('securityDeviceIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));
						const action = this.getNodeParameter('malwareActionType', i) as number;

						const body = {
							'$R': {
								devices: deviceIds,
								action,
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/security/manage/malware-actions-devices`,
							body,
						);
					}
				}

				// ==================== STATISTICS ====================
				else if (resource === 'statistics') {
					if (operation === 'getDeviceSummary') {
						responseData = await comodoApiRequest.call(
							this,
							'GET',
							`${baseUrl}/api/v2/itsm/statistics/device/summary`,
						);
					}
				}

				// ==================== PROCEDURE ====================
				else if (resource === 'procedure') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = returnAll ? 500 : (this.getNodeParameter('limit', i) as number);

						const body = {
							'$O': {
								columns: ['name', 'type', 'status', 'procedure_type', 'added_by', 'updated_by', 'added_at', 'updated_at', 'description'],
							},
							'$S': {
								pagination: {
									limit,
									offset: 0,
								},
								sort: {
									name: 'asc',
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/procedures/search`,
							body,
						);
					} else if (operation === 'get') {
						const procedureId = this.getNodeParameter('procedureId', i) as string;
						responseData = await comodoApiRequest.call(
							this,
							'GET',
							`${baseUrl}/api/v2/itsm/procedures/${procedureId}`,
						);
					} else if (operation === 'run') {
						const procedureId = this.getNodeParameter('procedureId', i) as string;
						const deviceIds = (this.getNodeParameter('procedureDeviceIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim(), 10));

						const body = {
							'$R': {
								target: 2,
								deviceIds,
								userType: 1,
								procedureType: 1,
								parameters: [],
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'PUT',
							`${baseUrl}/api/v2/itsm/procedures/run/${procedureId}`,
							body,
						);
					} else if (operation === 'getLogsByDevice') {
						const deviceId = this.getNodeParameter('logsDeviceId', i) as string;

						const body = {
							'$O': {
								columns: ['procedure', 'startedAt', 'finishedAt', 'profile', 'launchType', 'runner', 'status', 'lastUpdateTime', 'executionId'],
							},
							'$S': {
								pagination: {
									limit: 20,
									offset: 0,
								},
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/procedures/logs-by-device/${deviceId}`,
							body,
						);
					} else if (operation === 'create') {
						const procedureName = this.getNodeParameter('procedureName', i) as string;
						const procedureDescription = this.getNodeParameter('procedureDescription', i) as string;

						const body = {
							'$R': {
								name: procedureName,
								id_category: 1,
								description: procedureDescription,
							},
							'$O': {
								columns: ['id', 'name'],
							},
						};

						responseData = await comodoApiRequest.call(
							this,
							'POST',
							`${baseUrl}/api/v2/itsm/procedures`,
							body,
						);
					}
				}

				// Handle array vs single object response
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item) => ({ json: item })));
				} else {
					returnData.push({ json: responseData });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Helper function to make API requests
async function comodoApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	url: string,
	body?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('comodoApi');
	
	const options: IDataObject = {
		method,
		url,
		headers: {
			'Authorization': `CONESSO ${credentials.apiToken}`,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		},
		json: true,
		resolveWithFullResponse: false,
	};

	if (body) {
		options.body = body;
	}

	try {
		const response = await this.helpers.request(options);
		// Parse response if it's a string
		if (typeof response === 'string') {
			try {
				return JSON.parse(response) as IDataObject;
			} catch {
				return { rawResponse: response } as IDataObject;
			}
		}
		return response as IDataObject;
	} catch (error: unknown) {
		const err = error as { message?: string; statusCode?: number; response?: { body?: string } };
		let errorMessage = err.message || 'Unknown error';
		
		// Try to extract more details from the error
		if (err.response?.body) {
			try {
				const errorBody = typeof err.response.body === 'string' 
					? JSON.parse(err.response.body) 
					: err.response.body;
				if (errorBody.$E?.message) {
					errorMessage = `${errorBody.$E.message} (Code: ${errorBody.$E.error_code || 'unknown'})`;
				}
			} catch {
				// Keep original error message
			}
		}
		
		throw new NodeOperationError(
			this.getNode(), 
			`Comodo API Error: ${errorMessage}`,
			{ description: `URL: ${url}, Method: ${method}` }
		);
	}
}

// Helper function to build search body with filters
function buildSearchBody(additionalFields: IDataObject, limit: number, offset: number): IDataObject {
	const attributes: IDataObject = {};

	// Always include OS type filter - required by API
	// If user specified OS types, use those, otherwise include all
	if (additionalFields.osType && (additionalFields.osType as number[]).length > 0) {
		attributes.os_type = {
			value: additionalFields.osType,
			type: 'in:enum',
		};
	} else {
		// Include all OS types by default (Windows, macOS, Linux, iOS, Android)
		attributes.os_type = {
			value: [1, 2, 3, 4, 5],
			type: 'in:enum',
		};
	}

	// Company name filter
	if (additionalFields.companyName) {
		attributes.companyName = {
			value: additionalFields.companyName,
			type: 'ilike:string',
		};
	}

	// Company IDs filter
	if (additionalFields.companyIds) {
		const companyIds = (additionalFields.companyIds as string)
			.split(',')
			.map((id) => parseInt(id.trim(), 10));
		attributes.companyIds = {
			value: companyIds,
			type: 'in:int',
		};
	}

	// Device name filter
	if (additionalFields.deviceName) {
		attributes.name = {
			value: additionalFields.deviceName,
			type: 'ilike:string',
		};
	}

	// Online status filter
	if (additionalFields.onlineStatus && additionalFields.onlineStatus !== 0) {
		attributes.online_status = {
			value: [additionalFields.onlineStatus],
			type: 'in:enum',
		};
	}

	// Security client status filter
	if (additionalFields.securityClientStatus && (additionalFields.securityClientStatus as number[]).length > 0) {
		attributes.securityClientStatus = {
			value: additionalFields.securityClientStatus,
			type: 'in:enum',
		};
	}

	// Group IDs filter
	if (additionalFields.groupIds) {
		const groupIds = (additionalFields.groupIds as string)
			.split(',')
			.map((id) => parseInt(id.trim(), 10));
		attributes.groupIds = {
			value: groupIds,
			type: 'in:int',
		};
	}

	const searchParams: IDataObject = {
		pagination: {
			limit,
			offset,
		},
		attributes,
		sort: {
			name: 'asc',
		},
	};

	return {
		'$S': searchParams,
	};
}


