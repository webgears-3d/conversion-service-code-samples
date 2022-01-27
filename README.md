# Code Samples

### Contents

[Conversion Service Helper](#conversion-service-helper)  
[WMD viewer](#wmd-viewer)  


### Conversion Service Helper


NodeJS scripts for converting models.

Helper supports:

- `.zip` archive with assembly and assembly root file name supplied as argument
- following CAD formats:  
  `.sldasm, .sldprt, .prt, .prt.1, .prt.2, .ifc, .ipt, .rvt, .stp, .step, .x_t, .catpart`

To run helper:

1. <a href='https://docs.npmjs.com/downloading-and-installing-node-js-and-npm'>install NodeJS (version >= 10) and NPM (version >= 6)</a>
2. Create `credentials.json` with provided credentials
3. `cd helper`
4. `npm i`
5. `node app.js -i <PATH_TO_YOUR_MODEL_FILE> -r <ASSEMBLY_ROOT_FILE_PATH_IF_NEEDED>`
6. converted result will be put in `output` folder

#### Example:

```bash
$ node app.js -i "samples/Resort Homey059.rvt"
```
```bash
$ node app.js -i samples/chair.zip -r chair/Chair_Assem_Rotate_v1.iam
```
```bash
$ node app.js -i samples/RaspberryPI4.zip -r "assembly/Assembly Raspberry Pi 4 B.SLDASM"
```

### WMD viewer

Sandbox viewer to display converted models

To run viewer:

1. `cd viewer`
2. put folder with converted `wmd` model to `viewer/models`
3. `npx node-static -a 0.0.0.0`
4. Go to http://0.0.0.0:8080/?model=name-of-the-model-folder (replace "name-of-the-model-folder" with the name of the converted model folder).  
   **IMPORTANT: All symbols in model name must be URL-encoded**  
   **example:**
   http://0.0.0.0:8080/?model=chair

