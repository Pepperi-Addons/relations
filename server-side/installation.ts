
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { realationsTableScheme } from './entities';

export async function install(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });

    return await createADALScheme(papiClient);    
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });

    // var headersADAL = {
    //     "X-Pepperi-OwnerID": client.AddonUUID,
    //     "X-Pepperi-SecretKey": client.AddonSecretKey
    // }

    // papiClient.post(`/addons/data/schemes/${realationsTableScheme.Name}/purge`, null, headersADAL);
    try {
        await papiClient.addons.data.schemes.purge(realationsTableScheme.Name);
        return {success:true,resultObject:{}}
    }
    catch(err) {
        return {
            success: false,
            errorMessage: 'Could not remove ADAL Table. ' + ('message' in err) ? 'Got error ' + err.message : 'Unknown error occured.',
        }
    }
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });

    return await createADALScheme(papiClient);
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

async function createADALScheme(papiClient: PapiClient) {
    try {
        await papiClient.addons.data.schemes.post(realationsTableScheme);
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