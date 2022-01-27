const path = require( 'path' );
const {Command} = require('commander')
const {createApi, convertFile} = require( './helpers' );
const {
    host,
    port,
    protocol,
    apiRoot,
    auth,
    username,
    password,
    storage
} = require('./credentials.json')

const outFolder = path.resolve( __dirname, './output' );

const api = createApi( {
    host, port, protocol, apiRoot, auth, username, password, storage
} );

const program = new Command();

program
    .requiredOption('-i, --input <string>', 'input model path')
    .option('-r, --root-file <string>', 'assembly root file path (relative to assembly root folder)');

program.parse(process.argv);

const sample = program.opts().input;
const assemblyFilename = program.opts().rootFile;

if (!sample) {
    throw 'no model provided'
}

const cadExtensions = ['.sldasm', '.sldprt', '.prt', '.prt.1', '.prt.2', '.ifc', '.ipt', '.rvt', '.stp', '.step', '.x_t']
const regexp = new RegExp(`(${cadExtensions.join('|')})$`);

const ext = sample.match(regexp) ? sample.match(regexp)[0] :  path.extname( sample ).toLowerCase()

const isCadExtension = (filename) => {
    return regexp.test(filename);
}

const sampleRecipe = ( sample ) => {
    const ext = path.extname( sample ).toLowerCase();
    if ( ext === '.zip' ) {
        return 'zip2cad2wmdOpt'
    }
    if ( isCadExtension(sample) ) {
        return 'cad2wmdOpt'
    }
    throw `no recipe for file ${sample} found`;
}

(async () => {
    try {
        await convertFile(
            api,
            sample,
            ext,
            outFolder,
            sampleRecipe( sample ),
            false,
            assemblyFilename ? {assemblyFilename} : {}
        );

    } catch ( e ) {
        console.log( e );
    }
})();
