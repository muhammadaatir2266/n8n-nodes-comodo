# n8n-nodes-comodo

This is an n8n community node for **Comodo Endpoint Manager** (also known as Xcitium/ITSM). It allows you to interact with Comodo RMM and Antivirus data to sync with other systems like Datto Autotask.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

This node supports the following resources and operations:

### Devices
- **Get All** - Retrieve all devices with filtering options
- **Get** - Get device summary by ID
- **Get With CCS Details** - Get devices with Comodo Client Security (Antivirus) details
- **Get Count** - Get device count by search criteria
- **Reboot** - Send reboot command to devices
- **Update AV Database** - Update antivirus database on devices
- **Update CCS** - Update Comodo Client Security on devices

### Device Groups
- **Get All** - Get all device groups
- **Get** - Get device group by ID
- **Create** - Create a new device group
- **Delete** - Delete a device group
- **Rename** - Rename a device group

### Alerts
- **Get All** - Search and get all alerts
- **Get** - Get alert details by ID
- **Get Logs By Device** - Get alert logs for a specific device
- **Create** - Create a new alert
- **Update** - Update an existing alert
- **Delete** - Delete alerts

### Monitors
- **Get All** - Search and get all monitors
- **Get** - Get monitor details by ID
- **Get Logs By Device** - Get monitoring logs for a specific device
- **Get Execution Log Details** - Get detailed execution logs
- **Create** - Create a new monitor
- **Update** - Update an existing monitor

### Security (Antivirus)
- **Run Scan** - Run antivirus scan on devices (Quick or Full)
- **Stop Scan** - Stop antivirus scan on devices
- **Quarantine Action** - Delete or restore quarantined files
- **Malware Action** - Run action on detected malware (Quarantine, Delete, Ignore, Clean)

### Statistics
- **Get Device Summary** - Get summary statistics of all devices

### Procedures
- **Get All** - Search and get all procedures
- **Get** - Get procedure details by ID
- **Run** - Run a procedure on devices
- **Get Logs By Device** - Get procedure logs for a specific device
- **Create** - Create a new script procedure

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-comodo` in the **Enter npm package name** field
4. Agree to the risks of using community nodes
5. Select **Install**

### Manual Installation

To install this node manually in your n8n instance:

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-comodo

# Restart n8n
```

For Docker installations, add to your Dockerfile:
```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-comodo
```

Or mount the node as a volume in docker-compose:
```yaml
volumes:
  - ./n8n-nodes-comodo:/home/node/.n8n/nodes/n8n-nodes-comodo
```

## Configuration

### Credentials

1. In n8n, go to **Credentials** and create a new credential
2. Search for "Comodo Endpoint Manager API"
3. Enter your credentials:
   - **API Token**: Your Comodo C1 API Token
   - **Region**: Select US or EU based on your account location

### Getting Your API Token

1. Log in to your Comodo Endpoint Manager console
2. Navigate to **Settings > API**
3. Generate a new API token
4. Copy the token and use it in n8n credentials

## Example Workflows

### Sync Comodo Devices to Autotask

This workflow fetches all devices from Comodo and syncs them to Datto Autotask:

1. **Schedule Trigger** - Run every hour
2. **Comodo Node** - Get All Devices with CCS Details
3. **Loop Over Items** - Process each device
4. **Autotask Node** - Create/Update Configuration Item

### Get RMM and AV Status for QBR Reports

```json
{
  "nodes": [
    {
      "name": "Comodo - Get Devices",
      "type": "n8n-nodes-comodo.comodo",
      "parameters": {
        "resource": "device",
        "operation": "getWithCcs",
        "returnAll": true
      }
    }
  ]
}
```

### Monitor Device Health

1. **Comodo Node** - Get Device Summary Statistics
2. **IF Node** - Check for offline devices
3. **Slack/Email Node** - Send alert notification

## Data Retention for QBR Reports

To keep 30 days of RMM data for QBR reports:

1. Create a workflow that runs daily
2. Use the Comodo node to fetch device statistics
3. Store the data in a database (PostgreSQL, MySQL, etc.)
4. Create a separate workflow to generate QBR reports from stored data

Example data points to collect:
- Device online/offline status
- CPU/Memory/Disk usage (via monitors)
- Security scan results
- Patch status
- Alert history

## API Reference

This node uses the Comodo Endpoint Manager API v2. The base URL format is:
- US: `https://api-gw.itsm-us1.comodo.com/api/v2/itsm/`
- EU: `https://api-gw.itsm-eu1.comodo.com/api/v2/itsm/`

Authentication uses the `CONESSO` token scheme:
```
Authorization: CONESSO <your-api-token>
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Verify your API token is correct and hasn't expired
2. **Region Mismatch**: Ensure you selected the correct region (US/EU) in credentials
3. **Permission Denied**: Check that your API token has the required permissions

### Debug Mode

Enable debug mode in n8n to see detailed API requests and responses:
```bash
export N8N_LOG_LEVEL=debug
```

## Support

- [n8n Community Forum](https://community.n8n.io/)
- [Comodo/Xcitium Support](https://www.xcitium.com/support/)

## License

[MIT](LICENSE.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### 1.0.0
- Initial release
- Support for Devices, Device Groups, Alerts, Monitors, Security, Statistics, and Procedures





