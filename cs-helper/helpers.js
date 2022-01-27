const path = require( 'path' );
const fs = require( 'fs-extra' );
const FormData = require( 'form-data' );
const fetch = require( 'node-fetch' );

const TIMEOUT = 180 * 60 * 1000;

const createApi = ( {
                        host = 'localhost',
                        port = '3000',
                        protocol = 'http',
                        auth = false,
                        storage = 's3',
                        apiRoot = '',
                        username = '',
                        password = ''
                    } ) => {

    const baseUrl = ( route = '' ) => `${protocol}://${host}${!!port ? ':' + port : ''}${apiRoot}/${route}`;

    const jsonResult = ( res ) => {
        if ( res.ok ) {
            return res.json()
        } else {
            throw Error( res.statusText )
        }
    };

    const authHeader = {'Authorization': 'Basic ' + Buffer.from( username + ":" + password ).toString( 'base64' )};

    const getHeaders = (headers = {}) => {
        return auth
            ? {
                ...authHeader,
                ...headers
            } :
            headers
    }

    return {
        async create( inputPath, inputOptions, recipe ) {
            const fd = new FormData();

            const headers = getHeaders(fd.getHeaders())

            fd.append( 'input', fs.createReadStream( inputPath ) );
            fd.append( 'recipe', recipe );

            Object.entries( inputOptions )
                  .map( ( [key, value] ) => {
                      fd.append( key, value.toString() )
                  } );

            return fetch( baseUrl( 'jobs' ), {
                method: 'POST',
                body: fd,
                headers
            } )
                .then( jsonResult )
                .then( json => json.id );
        },

        async checkStatus( id ) {
            return fetch( baseUrl( `jobs/${id}/status` ), {headers: getHeaders()} )
                .then( jsonResult );
        },

        async getFiles( id ) {
            return fetch( baseUrl( `jobs/${id}/files` ), {headers: getHeaders()} )
                .then( jsonResult );
        },

        async downloadFile(inUrl, outPath) {
            const fetchUrl = process.env.STORAGE === 'fs' ? baseUrl(inUrl) : inUrl;

            return fs.ensureDir(path.dirname(outPath))
                     .then(() => {
                         return fetch(fetchUrl)
                     })
                     .then(res => {
                         if (res.ok){
                             const outFile = fs.createWriteStream(outPath);
                             res.body.pipe(outFile);
                             return new Promise((resolve, reject) => {
                                 outFile.on('finish', resolve);
                                 outFile.on('error', reject);
                             });
                         } else {
                             throw Error(res.statusText)
                         }
                     });
        }
    }
};

const sleep = ( ms = 0 ) => new Promise( r => setTimeout( r, ms ) );

const convertFile = async ( api, inputFile, ext, outputDir, recipe, showProgress = true, inputOptions = {} ) => {

    const waitForFinish = async ( id ) => {
        const started = Date.now();
        let status = '';
        while ( !['finished', 'canceled'].includes( status ) ) {
            await sleep( 500 );

            let statusReport = await api.checkStatus( id );
            if ( showProgress ) {
                console.log( 'progress: ', statusReport.progress );
            }

            status = statusReport.status;
            if ( status === 'error' ) {
                throw new Error( 'Conversion error' )
            }

            if ( Date.now() - started > TIMEOUT ) {
                throw new Error( `Timeout occur while waiting job with id ${id} to be done` );
            }
        }
        return status === 'finished';
    };

    const id = await api.create( inputFile, inputOptions, recipe );
    const finishSuccess = await waitForFinish( id );

    if ( finishSuccess ) {
        const files = await api.getFiles( id );
        const inputName = path.basename( inputFile, ext );
        const outFile = (name) => path.join( outputDir, inputName, path.basename(name) );

        return Promise.all(
            files.map( f => api.downloadFile( f.url, outFile( f.name ) ) )
        );
    }
};

module.exports = {
    createApi,
    convertFile
};
