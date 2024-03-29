
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
        await papiClient.notification.subscriptions.upsert({
            Key:"uninstall_relations_subscription",
            AddonUUID: client.AddonUUID,
            AddonRelativeURL: '/api/uninstall_relations',
            Type: 'data',
            Name: 'uninstall_relations_subscription',
            FilterPolicy: {
                Action:['update'],
                ModifiedFields:['Hidden'],
                Resource:['installed_addons'],
                AddonUUID:['00000000-0000-0000-0000-000000000a91']
            }
        })
           
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: err instanceof Error ? 'Could not create ADAL Table. ' +  (err as Error).message : 'Unknown error occured'
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
        //await papiClient.addons.data.schemes.purge(relationsTableScheme.Name);
        // calling endpoint directly - no purge in papi sdk
        console.log("removing the table containing all relations - should be epty by now");
        await papiClient.post(`addons/data/schemes/${relationsTableScheme.Name}/purge`, {});
        console.log("unsibscribe to PNS, we are uninstalling the addon, in theory, this should also be done by PNS addon");
        await papiClient.notification.subscriptions.upsert({
            Hidden: true,
            Key:"uninstall_relations_subscription",
            AddonUUID: client.AddonUUID,
            AddonRelativeURL: '/api/uninstall_relations',
            Type: 'data',
            Name: 'uninstall_relations_subscription',
            FilterPolicy: {
            }
        })
    }
    catch(err) {
        const message =  err instanceof Error ? 'Got error:' +  (err as Error).message : `Unknown error occured `
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
