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



export async function updateProgress(progress: number):Promise<boolean> {
  try {
    // Ensure progress is within the valid range (0 to 100)
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100.');
    }

    // Convert progress to a formatted string with two decimal places and a percentage sign
    const progressString = progress.toFixed(2) + '%';

    // Delete any previously created progress files
    const status = await deletePreviousProgress();
    if(status == false) return false;
    // Create a new progress file
    await fs.writeFile(progressString, '');

    console.log(`Progress updated to ${progressString}.`);
    return true;
  } catch (error) {
    console.error('Error updating progress:', error);
    return false;
  }
}

export async function deletePreviousProgress():Promise<boolean> {
  try {
    // Read the current directory to find progress files
    const files = await fs.readdir('./');

    // Filter out files with progress filenames
    const progressFiles = files.filter(file => /^\d+\.\d+%$/.test(file));
    console.log(progressFiles)
    if(progressFiles.length == 0) return false
    // Delete each progress file
    for (const file of progressFiles) {
      await fs.unlink(file);
      console.log(`Deleted previous progress file: ${file}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting previous progress files:', error);
    return false;
  }
}