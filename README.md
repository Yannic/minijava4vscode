# Minijava VScode extension

A small extension for the MiniJava language developed in the compiler course at TU Kaiserslautern.

The language server is not included.
The location of the jar file has to be configured in the extension settings under `minijava.minijavaJar`.


## Developer information

If you want to build the extension yourself:

1. First install
    - Node.js (newer than 4.3.1)
    - Npm  (newer 2.14.12)
2. clone the project from [GitHub](https://github.com/peterzeller/minijava4vscode).
3. Change to the project directory (e.g. `cd minijava4vscode`)
4. Run `npm i`
5. Open the project in Visual Studio Code (`code .`)
6. Press `F5` to debug (it should start a new vscode window with MiniJava enabled)

Contributors can publish the extension to the Extension Marketplace using `vsce publish` as described in the [vsce - Publishing Tool Reference](https://code.visualstudio.com/docs/tools/vscecli).
To update the version use `npm version patch`.
