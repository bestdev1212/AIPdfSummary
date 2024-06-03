import {
    readJsonFile
} from './util'

import {
    ConfigA,
    ConfigB
} from './type'

export let configB:ConfigB | null = null
export let configA:ConfigA | null = null


// load configuration from jsonA and jsonB
export async function loadConfig(){
    try {
        configA = await readJsonFile('a.json');
        configB = await readJsonFile('b.json');
    } catch (error) {
        throw error;
    }
}





