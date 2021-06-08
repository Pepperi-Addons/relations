
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { relationsTableScheme } from './entities';

export async function install(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID
    });
    
    try {
        await papiClient.addons.data.schemes.post(relationsTableScheme);
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: 'Could not create ADAL Table. ' + ('message' in err) ? 'Got error ' + err.message : 'Unknown error occured.',
        }
    }    
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey,
        actionUUID: client.ActionUUID
    });

    try {
        await papiClient.addons.data.schemes.purge(relationsTableScheme.Name);
    }
    catch(err) {
        const message = ('message' in err) ? 'Got error ' + err.message : 'Unknown error occured.'
        console.error(`Could not remove ADAL Table. ${message}`);
    }
    finally {
        return {
            success:true,
            resultObject:{}
        }
    }
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}
