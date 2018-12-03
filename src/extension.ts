/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext } from 'vscode';
import os_homedir = require('os-homedir');
import * as fs from 'fs';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
    Executable
} from 'vscode-languageclient';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
    let config = workspace.getConfiguration("minijava")
    let fileExtension = config.get<string>("fileExtension")


    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions = await getServerOptions();

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [fileExtension],
        synchronize: {
            // Synchronize the setting section to the server
            configurationSection: 'minijava',
            // Notify the server about file changes to '.java files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.' + fileExtension)
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'MiniJavaServer',
        'MiniJava Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

async function getServerOptions(): Promise<ServerOptions> {
    let config = workspace.getConfiguration("minijava")
    let java = config.get<string>("javaExecutable")
    let minijavaJar = config.get<string>("minijavaJar").replace("$HOME", os_homedir());
    let fileExtension = config.get<string>("fileExtension")
    let debugMode = config.get<boolean>("debugMode")

    if (!(await doesFileExist(minijavaJar))) {
        let msg = `Could not find ${minijavaJar}. Please configure 'minijava.minijavaJar' in your settings.json`
        vscode.window.showErrorMessage(msg);
        return Promise.reject(msg);
    }

    let args = ["-jar", minijavaJar, "-languageServer"]
    if (debugMode) {
        if (await isPortOpen(5005)) {
            args = ["-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005,quiet=y"].concat(args);
        }
    }

    let exec: Executable = {
        command: java,
        args: args
    };

    let serverOptions: ServerOptions = {
		run : exec,
		debug: exec
	}
    return serverOptions;
}

function isPortOpen(port): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let net = require('net');
        let tester = net.createServer();
        tester.once('error', function (err) {
            if (err.code == 'EADDRINUSE') {
                resolve(false);
            }
        });
        tester.once('listening', function() {
            tester.close()
            resolve(true);

        });
        tester.listen(port);
    });
}


function doesFileExist(filename): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
            resolve(!err);
        });
    });
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
