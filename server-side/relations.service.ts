import { PapiClient, Relation } from '@pepperi-addons/papi-sdk'
import { Client, Request } from '@pepperi-addons/debug-server'
import { relationsTableScheme } from './entities';
import config from '../addon.config.json'

class RelationsService {

    papiClient: PapiClient

    constructor(private client: Client, request: Request) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            actionUUID: client.ActionUUID,
            addonSecretKey: client.AddonSecretKey,
            addonUUID: client.AddonUUID
        });
    }

    async upsert(client:Client, request: Request){
        const body = request.body;
        await this.validatePostData(client, request);
        body['Key'] = `${body['Name']}_${body['AddonUUID']}_${body['RelationName']}`;
        await this.papiClient.addons.data.uuid(config.AddonUUID).table(relationsTableScheme.Name).upsert(body);
    }

    async find(query:any){
        if(query.key != null) {
            return this.papiClient.addons.data.uuid(config.AddonUUID).table(relationsTableScheme.Name).key(query.key).get();
        }
        else {
            return this.papiClient.addons.data.uuid(config.AddonUUID).table(relationsTableScheme.Name).find(query);
        }
    }

    private async validatePostData(client:Client, request: Request) {
        const body = request.body;
        const ownerUUID = (request.header['X-Pepperi-OwnerID'] == null ? null : request.header['X-Pepperi-OwnerID'].toLowerCase());
        const addonSecretKey = (request.header['X-Pepperi-SecretKey'] == null ? null : request.header['X-Pepperi-SecretKey'].toLowerCase());
        await this.validateOwner(body['AddonUUID'], ownerUUID, addonSecretKey, client);
        this.validateParam(body, 'RelationName');
        this.validateParam(body, 'Name');
        this.validateParam(body, 'AddonUUID');
        this.validateParam(body, 'Type'); 
        this.validateTypeParams(body);
    }

    async validateOwner(addonUUID:string, ownerUUID: string, secretKey: string, client: Client) {
        if(addonUUID != ownerUUID) {
            throw new Error('AddonUUID must be equal to X-Pepperi-OwnerID header value');
        }
        try {
            const papiClient = new PapiClient({
                baseURL: client.BaseURL,
                token: client.OAuthAccessToken,
                actionUUID: client.ActionUUID,
                addonSecretKey: secretKey,
                addonUUID: addonUUID
            });
            // var headersADAL = {
            //     "X-Pepperi-SecretKey": secretKey
            // }

            await papiClient.apiCall('GET', `/var/sk/addons/${addonUUID}/validate`);

            // await this.papiClient.addons.api.uuid(ADAL_UUID).file('api').func('addon_validate').get({
            //     addon_uuid: addonUUID
            // });
        }
        catch(err) {
            console.error('got error: ', JSON.stringify(err));
            throw new Error('secret key must match to addon UUID')
        }
    }

    private validateTypeParams(body:any) {
        switch (body['Type']) {
            case 'NgComponent': {
                this.validateParam(body, 'SubType');
                this.validateParam(body, 'ComponentName');
                this.validateParam(body, 'ModuleName');
                this.validateParam(body, 'AddonRelativeURL');
                break;
            }
            case 'Navigate':
            case 'AddonAPI': {
                this.validateParam(body, 'AddonRelativeURL');
                break;
            }
            default: {
                throw new Error(`${body['Type']} is not supported type on relations`);
            }
        }
    }
    
    validateParam(obj:any, paramName:string) {
        if(obj[paramName] == null) {
            throw new Error(`${paramName} is a required field`);
        }
    }

    async deleteAddonRelations(addonUUID: string) {
        const relations = await this.find({
            where: `AddonUUID=${addonUUID}`
        }) as Relation[];
        console.log(`About to delete relations:${JSON.stringify(relations.map(x=>{return x.Key}))}`)
        if (relations) {
            relations.forEach(async (relation) => {
                await this.papiClient.addons.data.uuid(config.AddonUUID).table(relationsTableScheme.Name).key(relation.Key!).hardDelete(true);
            })
        }
    }
}

export default RelationsService;