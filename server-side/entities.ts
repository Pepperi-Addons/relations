import { AddonDataScheme } from "@pepperi-addons/papi-sdk";

export const relationsTableScheme: AddonDataScheme = {
    Name:'AddonRelations',
    Type:'indexed_data',
    Fields:{
        RelationName: {
            Type:"String",
            Indexed: true
        },
        AddonUUID: {
            Type:"String"
        },
        Name: {
            Type:"String"
        },
        Type: {
            Type:"String"
        },
        Description: {
            Type:"String"
        }
    },
}