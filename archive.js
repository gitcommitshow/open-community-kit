import * as path from 'path';
import * as fs from 'fs';

/**
 * Writes json data to a csv file
 * @param {Array<Object>} data - The data to be written to the file.
 * @param {string} [options.archiveFolder=process.cwd()] - The folder where the file will be saved. Defaults to the current working directory.
 * @param {string} [options.archiveFileName='archive-YYYYMMDDHHmmss.csv'] - The name of the file to be written. Defaults to 'archive-YYYYMMDDHHmmss.csv'.
 */
export function save(data, options = {}) {
    if (!data || !Array.isArray(data) || data.length<1) {
        console.log("No content to write.");
        return;
    }
    // Prepare content for csv
    let allKeys = Array.from(new Set(data.flatMap(Object.keys)));    
    const headers = allKeys.join(',');
    const rows = data.map(obj => formatCSVRow(obj, allKeys)).join("\n");
    const csvContent = headers + "\n" + rows;
    writeToFile(csvContent, options);
    return csvContent;
}

export function writeToFile(content, options){
    const ARCHIVE_FOLDER = options.archiveFolder || process.cwd();
    const ARCHIVE_FULL_PATH = path.join(ARCHIVE_FOLDER, options.archiveFileName || `archive-${getFormattedDate()}.csv`);
    fs.writeFile(ARCHIVE_FULL_PATH, content, { flag: 'a+' }, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("The file was saved!");
    });
}

function formatCSVRow(obj, keys) {
    return keys.map(key => formatCSVCell(obj[key])).join(',');
}

function formatCSVCell(value) {
    if (value === undefined || value === null) {
        return '';
    } else if (typeof value === 'object') {
        // Stringify objects/arrays and escape double quotes
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
    } else if (typeof value === 'string') {
        // Check for commas or line breaks and escape double quotes
        if (value.includes(',') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        } else {
            return value;
        }
    } else {
        return value.toString();
    }
}

export function getFormattedDate() {
    const now = new Date();
    return now.toISOString().replace(/[\-\:T\.Z]/g, '');
}