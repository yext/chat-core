## Testing Process

### Unit Testing
We use Jest as our framework for unit tests. Execute the unit tests with the following command:
```
npm run test
```

### Test Environments
The `chat-core` library is designed to be compatible with both CommonJS and ES6 import styles. Additionally, it should function properly in both browser and Node.js environments. To ensure this, we have set up two distinct test environments:

- **Browser ESM Test Site:** For more information, refer to the README.md file located in the `test-sites/test-browser-esm` directory.

- **Node CJS Test Site:** For more details, consult the README.md file found in the `/test-node-cjs` directory.

## Build Process

Before initiating the build, run the linting process to identify and address any errors or warnings. Use the following command:
```
npm run lint
```

To build the library, execute:
```
npm run build
```
This will create the bundle in the `/dist` directory. This command will also generate documentation files and the `THIRD-PARTY-NOTICES` file.



For guidelines on pull request and version publish process, visit Chat SDK wiki page.