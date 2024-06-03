import OpenAI from "openai";
import fs from 'fs';

import {
    configA,
    configB,
    loadConfig,
} from './constant'

import {
    QA
} from './type'

import {
    writeFile,
    getFilenameWithoutExtension,
    removeBracketsAndContents,
    getFormattedResponse,
    convertMD2DocxAndSave
} from './util'

// main logic
async function main() {
    try{

        // load configs
        await loadConfig()
        console.log(configA, configB)
        if (!configB || !configA) {
            return
        }

        // get list of full path of pdfs
        const fullPaths = configB.input.files.map(v => configB?.input.directory + v)
        console.log(fullPaths)
        // init openai with user's openai key
        const openai = new OpenAI({ apiKey: configB?.openai_key });
    
     
        const qas: QA[] = []
        // create openai assistant with file search function
        const assistant = await openai.beta.assistants.create({
            name: "PDf Summary",
            instructions: `Answer user's question based on the knowledge from pdf files in file_search

            `,
            model: "gpt-4-turbo",
            // model: "gpt-4o",
            // model: "gpt-3.5-turbo",
            tools: [{ type: "file_search" }],
    
        });
        // loop through all pdfs
        for(let i=0; i<fullPaths.length; i++){

            // prepare file for filesearch
            const file = await openai.files.create({
                file: fs.createReadStream(fullPaths[i]),
                purpose: "fine-tune",
            });
        
            console.log(file);
            // create openai assistant thread
            const thread = await openai.beta.threads.create();
            // loop through queries
            for(let j=0; j<configA.queries.length; j++){
                let retries = 3;
                // retry query whenever it fails to get response
                while(retries>0){
                    const q = configA.queries[j]
                    // create message to feed
                    await openai.beta.threads.messages.create(thread.id, 
                        {
                            role: "user",
                            content:
                                q.query,
                            // Attach the new file to the message.
                            attachments: [{ file_id: file.id, tools: [{ type: "file_search" }] }],
                        }
                    );
            
                    // run thread with message
                    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
                        // assistant_id: "asst_V9lBEQL9uFHq0c7P8uoBYA5Q",
                        assistant_id: assistant.id,
                    });
            
                    // get response from openai 
                    const messages = await openai.beta.threads.messages.list(thread.id, {
                        run_id: run.id,
                    });
            
                    const message = messages.data.pop()!;
                    // if response is not get, retry again...
                    if(message == undefined){
                        retries--;
                        console.log("retrying...")
                        continue;
                    }
                    console.log(q.query)
                    console.log(message)
                    // if success, push into qa array
                    if (message.content[0].type === "text") {
                        const { text } = message.content[0];
                        const { value } = text
                        console.log(value)
                        qas.push({
                            question: q.query,
                            answer: value
                        })
                    }
                    break;
                }
                
            }
            
        
            console.log(qas)
            // get filename for docx
            const fileName = getFilenameWithoutExtension(configB.input.files[i])
            // arrange and convert response into docx and save
            await convertMD2DocxAndSave(configB.output.directory + fileName + '.docx', removeBracketsAndContents(getFormattedResponse(qas)))
            // delete file in storage
            await openai.files.del(file.id);
            // delete openai assistant
            await openai.beta.assistants.del(assistant.id);
            console.log('deleted file')
        }
        
       
    }catch(error){
        console.log(error)
        // write error in txt file
        await writeFile("./error.txt", error)
    }
    
}

main();