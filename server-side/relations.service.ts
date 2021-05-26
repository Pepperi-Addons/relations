import { PapiClient, InstalledAddon, AddonDataScheme } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server';
import { realationsTableScheme } from './entities';
import config from '../addon.config.json'

class RelationsService {

    papiClient: PapiClient

    constructor(private client: Client, request: Request) {
        let addonUUID = client.AddonUUID;
        if(request.method === 'POST') {
            this.validatePostData(request);
            addonUUID = request.body['AddonUUID'];
        }
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonSecretKey: client.AddonSecretKey,
            addonUUID: addonUUID
        });
    }

    async upsert(body:any){
        body['Key'] = `${body['Key']}_${body['AddonUUID']}_${body['Name']}`;
        await this.papiClient.addons.data.uuid(config.AddonUUID).table(realationsTableScheme.Name).upsert(body);
    }

    async find(query:any){
        if(query.key != null) {
            return this.papiClient.addons.data.uuid(config.AddonUUID).table(realationsTableScheme.Name).key(query.key).get();
        }
        else {
            return this.papiClient.addons.data.uuid(config.AddonUUID).table(realationsTableScheme.Name).find(query);
        }
    }

    private async validatePostData(request: any) {
        const body = request.body;
        const ownerUUID = (request.header['X-Pepperi-OwnerID'] == null ? null : request.header['X-Pepperi-OwnerID'].toLowerCase());
        if(body['Key'] == null) {
            throw new Error('Key is a required field');
        }
        if(body['Name'] == null) {
            throw new Error('Name is a required field');
        }
        if(body['AddonUUID'] == null) {
            throw new Error('AddonUUID is a required field');
        }
        if(body['AddonUUID'] != ownerUUID) {
            throw new Error('AddonUUID must be equal to X-Pepperi-OwnerID header value');
        }
        //When creating the object, Type should be mandatory
        if(!this.itemExists(body['key'], body['AddonUUID'], body['Name'])) {
            if(body['Type'] == null) {
                throw new Error('Type is a required field when creating new relation');
            }
            this.validateTypeParams(body['Type']);
        }
    }

    private validateTypeParams(body:any) {
        switch (body['Type']) {
            case 'NgComponent': {
                if(body['SubType'] == null) {
                    throw new Error('SubType is a required field on NgComponent relation Type');
                }
                if(body['ComponentName'] == null) {
                    throw new Error('ComponentName is a required field on NgComponent relation Type');
                }
                if(body['ModuleName'] == null) {
                    throw new Error('ModuleName is a required field on NgComponent relation Type');
                }
                if(body['AddonRelativeURL'] == null) {
                    throw new Error('AddonRelativeURL is a required field on NgComponent relation Type');
                }
                break;
            }
            case 'Navigate': {
                if(body['AddonRelativeURL'] == null) {
                    throw new Error('AddonRelativeURL is a required field on Navigate relation Type');
                }
                break;
            }
            case 'AddonAPI': {
                if(body['AddonRelativeURL'] == null) {
                    throw new Error('AddonRelativeURL is a required field on AddonApi relation Type');
                }
                break;
            }
            default: {
                throw new Error(`${body['Type']} is not supported type on relations`);
            }
        }
    }

    private async itemExists(key: string, addonUUID:string, relationName:string): Promise<boolean> {
        try {
            let data = await this.papiClient.addons.data.uuid(addonUUID).table(realationsTableScheme.Name).key(key).get();
            if(data.AddonUUID === addonUUID && data.Name === relationName){
                return true;
            }
            else {
                return false;
            }
        }
        catch(err) {
            return false;
        }
    }
}

export default RelationsService;