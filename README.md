# BESI-C Remote API

### Run Dev Server

	npm start


### Run Production Server
Build server

	npm run build

Run built server

	npm run exec


### Manage Database

	npx prisma generate

Create migrations during development

	npx prisma migrate dev --name <name>

Deploy to production database

	npx prisma migrate deploy



# API
Urls followings [localhost:3000/api](http://localhost:3000/api) or [api.besic.org](https://api.besic.org)

## /version
Gets data about currently running version.

#### Returns:
	{
		git: "0000000000000000000000000000000000000000", // current git commit hash
		dev: true // indicator of edits from commit, only present when true
	}


## /time
Gets time information.

#### Returns:
	{
		iso: "0000-00-00T00:00:00.000Z", // ISO 8601 datetime
		unix: 0000000000, // unix timestamp
		text: "Day Mon 00 0000 00:00:00 GMT+0000 (Coordinated Universal Time)"
	}


## /device/new
Creates a new device.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device MAC |
| `POST` | `password` | Password string |
| `POST` | `type` | Either `RELAY` or `BASESTATION` |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Password required` | Missing password |
| 400  | `Type required` | Missing type, either `RELAY` or `BASESTATION` |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 400  | `Invalid type` | Type wasn't `RELAY` or `BASESTATION` |
| 406  | `Duplicate device` | Device with this mac is already deployed |


## /device/heartbeat
Update device last seen info.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device MAC |
| `POST` | `password` | Password string |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Password required` | Missing password |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 401  | `Incorrect password` | Wrong password for device |
| 404  | `Unknown device` | Device with MAC not found |


## /device/deployment
Gets deployment state for device.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device MAC |
| `POST` | `password` | Password string |

#### Returns
	DEPLOYMENT_NAME="" # string name of deployment, empty if undeployed
	RELAY_ID="" # string containing integer id, empty if undeployed

| Code | Error | Description |
| :--: | :---- | :---------- |
| 400  | `MAC required` | Missing MAC |
| 400  | `Password required` | Missing password |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 401  | `Incorrect password` | Wrong password for device |
| 404  | `Unknown device` | Device with MAC not found |


## /device/data
Update device data readings and last seen info.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device MAC |
| `POST` | `password` | Password string |
| `POST` | `data` | Comma separated data string (ie `lux=0.0,tmp=0.0,prs=0.0,hum=0.0`) |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Password required` | Missing password |
| 400  | `Data required` | Missing data string |
| 400  | `Missing data value 'key'` | Missing value for `key` in data string |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 400  | `Invalid data 'str'` | Part of data string listed failed to parse |
| 401  | `Incorrect password` | Wrong password for device |
| 404  | `Unknown device` | Device with MAC not found |



## /manage/deployment/new
Creates new deployment. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `name` | Deployment name |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `Name required` | Missing name parameter |
| 400  | `Invalid Name` | Deployment name didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 401  | `Unauthorized` | Not accessed from localhost |
| 406  | `Duplicate deployment` | A deployment with this name already exists |


## /manage/deployment/delete
Deletes an existing deployment. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `name` | Deployment name |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `Name required` | Missing deployment name |
| 400  | `Invalid name` | Deployment name didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 401  | `Unauthorized` | Not accessed from localhost |
| 404  | `Unknown deployment` | Deployment with name not found |
| 405  | `Deployment locked` | Locked deployments cannot be deleted |
| 405  | `Deployment has devices` | Deployments with devices cannot be deleted |



## /manage/device/delete
Deletes an existing device. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device MAC |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 404  | `Unknown device` | Device with MAC not found |
| 401  | `Unauthorized` | Not accessed from localhost |
| 405  | `Device deployed` | Deployed devices cannot be deleted |


## /manage/device/nickname
Gives a device a human readable name. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device MAC |
| `POST` | `nickname` | Human readable name |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Nickname required` | Missing nickname |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 400  | `Invalid nickname` | Nickname didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 401  | `Unauthorized` | Not accessed from localhost |
| 404  | `Unknown device` | Device with MAC not found |
| 405  | `Device deployed` | Deployed devices cannot be deleted |


## /manage/device/insert
Adds a device to a deployment. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device mac |
| `POST` | `name` | Human readable name |
| `POST` | `id` | *OPTIONAL* Relay ID for device |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Name required` | Missing deployment name |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 400  | `Invalid name` | Deployment name didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 401  | `Unauthorized` | Not accessed from localhost |
| 404  | `Unknown device` | Device with MAC not found |
| 404  | `Unknown deployment` | Deployment with name not found |
| 405  | `Invalid ID` | ID must be a positive integer |
| 405  | `Deployment locked` | Devices cannot be added to locked deployments |
| 405  | `Deployment already deployed` | Deployed devices cannot deployed again |
| 406  | `ID already used in deployment` | Duplicate relay ID |


## /manage/device/remove
Adds a device to a deployment. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device mac |
| `POST` | `name` | Human readable name |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Name required` | Missing deployment name |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 400  | `Invalid name` | Deployment name didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 401  | `Unauthorized` | Not accessed from localhost |
| 404  | `Unknown device` | Device with MAC not found |
| 404  | `Unknown deployment` | Deployment with name not found |
| 404  | `Device not in deployment` | Devices not present in named deployment |
| 405  | `Deployment locked` | Devices cannot be removed from locked deployments |


## /manage/device/renumber
Change deployed device relay ID. Only available from localhost.

#### Parameters:
| Type   | Name | Description |
| :----: | :--- | :---------- |
| `POST` | `mac` | 12 hex digits of device mac |
| `POST` | `name` | Human readable name |
| `POST` | `id` | New relay ID for device |

#### Returns
| Code | String | Description |
| :--: | :----- | :---------- |
| 200  | `Success` | Deployment created |
| 400  | `MAC required` | Missing MAC |
| 400  | `Name required` | Missing deployment name |
| 400  | `ID required` | Missing new relay ID |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 400  | `Invalid name` | Deployment name didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 401  | `Unauthorized` | Not accessed from localhost |
| 404  | `Unknown device` | Device with MAC not found |
| 404  | `Unknown deployment` | Deployment with name not found |
| 404  | `Device not in deployment` | Devices not present in named deployment |
| 405  | `Invalid ID` | ID must be a positive integer |
| 405  | `Deployment locked` | Devices cannot be renumbered in locked deployments |
| 405  | `Deployment already deployed` | Deployed devices cannot deployed again |
| 406  | `ID already used in deployment` | Duplicate relay ID |



## /status/all
Get information about all deployments and devices.

#### Returns:
	{
		undeployed: array [
			{
				type: "", // device type ('RELAY' or 'BASESTATION')
				mac: "000000000000", // 12 hex digits of device mac
				nickname: "", // OPTIONAL device nickname
				last_seen: "0000-00-00T00:00:00.000Z", // time device was last seen
				addr: "", // IP address device was last seen at
				data: { // OPTIONAL
					lux: "0.0", // last lux data reading
					tmp: "0.0", // last temperature data reading
					prs: "0.0", // last pressure data reading
					hum: "0.0", // last humidity data reading
				}
			}
		],
		deployments: array [
			{
				name: "", // deployment name
				locked: bool // if deployment is locked (boolean)
				devices: array [
					{
						deployment: "", // deployment name
						type: "", // device type ('RELAY' or 'BASESTATION')
						relay_id: 0, // device id within deployment (int)
						mac: "000000000000", // 12 hex digits of device mac
						nickname: "", OPTIONAL device nickname
						last_seen: "0000-00-00T00:00:00.000Z", // time device was last seen
						addr: "", // IP address device was last seen at
						data: { // OPTIONAL
							lux: "0.0", // last lux data reading
							tmp: "0.0", // last temperature data reading
							prs: "0.0", // last pressure data reading
							hum: "0.0", // last humidity data reading
						}
					}
				]
			}
		]
	}


## /status/device
Get information about single device.

#### Parameters:
| Type  | Name | Description |
| :---: | :--- | :---------- |
| `GET` | `mac` | 12 hex digits of device mac |

#### Returns:
	{
		deployment: "", // deployment name
		type: "", // OPTIONAL device type ('RELAY' or 'BASESTATION')
		relay_id: 0, // OPTIONAL device id within deployment (int)
		mac: "000000000000", // 12 hex digits of device mac
		nickname: "", OPTIONAL device nickname
		last_seen: "0000-00-00T00:00:00.000Z", // time device was last seen
		addr: "", // IP address device was last seen at
		data: { // OPTIONAL
			lux: "0.0", // last lux data reading
			tmp: "0.0", // last temperature data reading
			prs: "0.0", // last pressure data reading
			hum: "0.0", // last humidity data reading
		}
	}

| Code | Error | Description |
| :--: | :---- | :---------- |
| 400  | `MAC required` | Missing MAC |
| 400  | `Invalid MAC` | MAC didn't fit REGEX (`[A-Fa-f0-9]{12}`) |
| 404  | `Unknown device` | Device with MAC not found |


## /status/deployment
Get information about single deployment.

#### Parameters:
| Type  | Name | Description |
| :---: | :--- | :---------- |
| `GET` | `name` | deployment name |

#### Returns:
	{
		name: "", // deployment name
		locked: bool // if deployment is locked (boolean)
		devices: array [
			{
				deployment: "", // deployment name
				type: "", // device type ('RELAY' or 'BASESTATION')
				relay_id: 0, // device id within deployment (int)
				mac: "000000000000", // 12 hex digits of device mac
				nickname: "", OPTIONAL device nickname
				last_seen: "0000-00-00T00:00:00.000Z", // time device was last seen
				addr: "", // IP address device was last seen at
				data: { // OPTIONAL
					lux: "0.0", // last lux data reading
					tmp: "0.0", // last temperature data reading
					prs: "0.0", // last pressure data reading
					hum: "0.0", // last humidity data reading
				}
			}
		]
	}

| Code | Error | Description |
| :--: | :---- | :---------- |
| 400  | `Name required` | Missing deployment name |
| 400  | `Invalid name` | Deployment name didn't fit REGEX (`[a-zA-Z][\w-\| ]*`) |
| 404  | `Unknown deployment` | Deployment with name not found |


## /status/summary
Get plain lists of device MACs and deployment names.

#### Returns:
	{
		devices: array [
			string: "000000000000", // device mac
		],
		deployments: array [
			string: "", deployment name
		]
	}


## /status/undeployed
Get devices not in a deployment.

#### Returns:
	array [
		{
			type: "", // device type ('RELAY' or 'BASESTATION')
			mac: "000000000000", // 12 hex digits of device mac
			nickname: "", // OPTIONAL device nickname
			last_seen: "0000-00-00T00:00:00.000Z", // time device was last seen
			addr: "", // IP address device was last seen at
			data: { // OPTIONAL
				lux: "0.0", // last lux data reading
				tmp: "0.0", // last temperature data reading
				prs: "0.0", // last pressure data reading
				hum: "0.0", // last humidity data reading
			}
		}
	]
