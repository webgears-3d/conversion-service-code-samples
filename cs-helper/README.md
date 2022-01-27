### Helper

Converts sample, output put in ./output 
Requires credentials.json file with conversion host credentials

```
cd helper
npm i
node app.js -i <YOUR_MODEL_ARCHIVE_OR_FILE> -r <ROOT_ASSEMBLY_FILE_IF_NEEDED>
```

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