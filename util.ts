import { promises as fs } from 'fs';
import { QA } from './type';
var markdown = require("markdown").markdown;
const HTMLtoDOCX = require('html-to-docx');

// read json file and return content
export async function readJsonFile(filePath: string) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = await JSON.parse(fileContent);
        console.log('JSON file content:', data);
        return data;
    } catch (error) {
        console.error('Error reading the file:', error);
        throw error; // Re-throw the error for further handling
    }
}

// write to file
export async function writeFile(filePath: string, content: string) {
    try {
        await fs.writeFile(filePath, content)
    } catch (error) {
        console.error('Error writing the file:', error);
        throw error; // Re-throw the error for further handling
    }
}

// get base file name without extension
export function getFilenameWithoutExtension(fullFilename: string) {
    // Use a regular expression to remove the file extension
    return fullFilename.replace(/\.[^/.]+$/, '');
}


// remove anything surrounded by brackets
export function removeBracketsAndContents(str: string) {
    return str.replace(/【.*?】/g, '');
}

// get formatted response 
export function getFormattedResponse(qas: QA[]) {
    var str = ""

    qas.forEach((v) => {
        str += "## " + v.question + "\n";
        str += v.answer;
        str += '\n\n';
    })
    return str;
}

// convert md into docx and save it
export async function convertMD2DocxAndSave(filePath: string, content: string) {
    try {
        const s = markdown.toHTML(content);
        const fileBuffer = await HTMLtoDOCX(s, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });
        await fs.writeFile(filePath, fileBuffer)
    } catch (error) {

    }
}