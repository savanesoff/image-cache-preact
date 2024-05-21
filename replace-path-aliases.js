import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import tsconfigPaths from 'tsconfig-paths';
const __dirname = path.resolve();

// Load the tsconfig file
const configFile = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.package.json');
if (!configFile) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
}

// Read the config file
const configFileText = fs.readFileSync(configFile, 'utf8');

// Parse the JSON of the config file
const result = ts.parseConfigFileTextToJson(configFile, configFileText);
if (result.error) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext([result.error], ts.createCompilerHost({})));
}

// Parse the config file
const configParseResult = ts.parseJsonConfigFileContent(result.config, ts.sys, path.dirname(configFile));

// Get the baseUrl and paths from the config file
const { baseUrl, paths } = configParseResult.options;
if (!baseUrl || !paths) {
    throw new Error("The 'baseUrl' or 'paths' option is missing in 'tsconfig.json'.");
}

// Setup tsconfig-paths to use the paths defined in the config file
const absoluteBaseUrl = path.resolve(baseUrl);
const matchPath = tsconfigPaths.createMatchPath(absoluteBaseUrl, paths);

// Function to replace aliases with relative paths
function replaceAliasWithRelativePath(filePath) {
    console.log(`Processing file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/(['"])(@[^'"]+)\1/g, (match, p1, p2) => {
        const resolved = matchPath(p2);
        if (!resolved) {
            console.log(`No match found for alias: ${p2}`);
            return match;
        }
        const relativePath = path.relative(path.dirname(filePath), resolved);
        console.log(`Replacing ${p2} with ${relativePath}`);
        return `${p1}${relativePath}${p1}`;
    });

    fs.writeFileSync(filePath, newContent, 'utf8');
}

// Function to recursively process files in a directory
function processDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    entries.forEach((entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile()) {
            replaceAliasWithRelativePath(fullPath);
        }
    });
}

// Start processing from the dist/esm directory
const distDir = path.resolve(__dirname, 'dist/esm');
processDirectory(distDir);