import csvParser from 'csv-parser';
import _ from 'lodash';
import cliProgress from 'cli-progress';
import * as fs from 'fs';

const evaluateFile = (filePath: string) => {
    return new Promise<number>((resolve, reject) => {
        let totalLines = 0;
        const readFile = fs.createReadStream(filePath);
        const csvStream = csvParser();
        
        readFile.pipe(csvStream)
        .on('data', () => {
            totalLines++;
        })
        .on('end', () => {
            resolve(totalLines);
        })
        .on('error', (err) => {
            reject(err);
        });
    });
};

const readCsvFile = async (filePath: string, outputPath: string | null, estimatedTotalLines: number) => {
    const startTime = Date.now();

    const outputRows: any[] = [];
    let totalLinesProcessed = 0;

    try {
        const fileStream = Bun.file(filePath).stream();
        const csvStream = csvParser();

        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(estimatedTotalLines, 0);

        csvStream.on('data', (row) => {
            totalLinesProcessed++;
            const rowSnakeCase = _.mapKeys(row, (_value, key) => _.snakeCase(key));
            outputRows.push(rowSnakeCase);
            
            bar.update(totalLinesProcessed);
        });

        for await (const chunk of fileStream) {
            const buffer = Buffer.from(chunk);
            csvStream.write(buffer);
        }

        csvStream.end();
        bar.stop();

        if (outputPath) {
            const jsonData = JSON.stringify(outputRows, null, 2);
            fs.writeFileSync(outputPath, jsonData);
        }

        const endTime = Date.now();
        const readingTime = ((endTime - startTime) / 1000).toFixed(2);

        // Output the results
        console.log(`File name: ${filePath}`);
        console.log(`Processing times: ${readingTime} seconds`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

const args = Bun.argv;
const fileIndex = args.indexOf('--file');
const outputIndex = args.indexOf('--output');

if (fileIndex !== -1 && fileIndex + 1 < args.length) {
    const filePath = args[fileIndex + 1];
    const outputPath = outputIndex !== -1 && outputIndex + 1 < args.length ? args[outputIndex + 1] : null;

    console.log("Reading file...")
    console.log("=================")

    evaluateFile(filePath)
        .then((estimatedTotalLines) => {
            console.log(`Estimated total lines: ${estimatedTotalLines}`);
            return readCsvFile(filePath, outputPath, estimatedTotalLines);
        })
        .catch((error) => {
            console.error('An error occurred during file evaluation:', error);
        });

} else {
    console.error('Please provide a file path using the --file argument.');
}
