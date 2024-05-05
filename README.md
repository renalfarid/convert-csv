# convert csv to json

clone this repository

install bun : https://bun.sh/

To install dependencies:

```bash
bun install
```

Compile to binary : 
```bash
bun build index.ts --compile --outfile <output file>
```
To run:

```bash
$ ./outputfile --file <csv file> --output <json file>
```

This project was created using `bun init` in bun v1.0.30. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
