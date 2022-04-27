import RelationsService from './relations.service'
import { Client, Request } from '@pepperi-addons/debug-server'


export async function relations(client: Client, request: Request) {
    const service = new RelationsService(client, request)
    if (request.method == 'POST') {
        return service.upsert(client, request);
    }
    else if (request.method == 'GET') {
        return await service.find(request.query);
    }
};

export async function uninstall_relations(client:Client, request: Request) {
    const service = new RelationsService(client, request);
    const obj = request.body?.Message?.ModifiedObjects[0];
    if(obj) {
        if(obj.ModifiedFields?.filter(x=> x.FieldID === 'Hidden' && x.NewValue === true)) {
            const uuid = await getAddonUUID(obj.ObjectKey, service);
            if(uuid) {
                await service.deleteAddonRelations(uuid);
            }
        }
    }    
    
    return {
        success:true,
        returnObject:{}
    }
}

async function getAddonUUID(installedAddonUUID: string, service: RelationsService) : Promise<string | undefined> {
    const installedAddon = await service.papiClient.addons.installedAddons.uuid(installedAddonUUID).get();
    if(installedAddon) {
        return installedAddon.Addon.UUID;
    }
    return undefined;
    
}

