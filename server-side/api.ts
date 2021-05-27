import RelationsService from './relations.service'
import { Client, Request } from '@pepperi-addons/debug-server'


export async function relations(client: Client, request: Request) {
    const service = new RelationsService(client, request)
    if (request.method == 'POST') {
        return service.upsert(request);
    }
    else if (request.method == 'GET') {
        return await service.find(request.query);
    }
};

