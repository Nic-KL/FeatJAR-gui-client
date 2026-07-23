/********************************************************************************
 * Copyright (c) 2019-2024 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import 'reflect-metadata';

import {
    BaseJsonrpcGLSPClient,
    DiagramLoader,
    GLSPActionDispatcher,
    GLSPClient,
    GLSPWebSocketProvider,
    MessageAction,
    StatusAction //,     TYPES
} from '@eclipse-glsp/client';
import { Container } from 'inversify';
import { join, resolve } from 'path';
import { MessageConnection } from 'vscode-jsonrpc';
import createContainer from './di.config';
import { ExitAction } from './client-exit-action';
import { SaveAction } from './client-save-action';


const HOST = GLSP_SERVER_HOST;
const PORT = GLSP_SERVER_PORT;

// (see FeatureModelDiagramModule.java)
const DIAGRAM_TYPE = 'featuremodel-diagram';
// The server uses 'featuremodel' as the WebSocket endpoint
// (see FeatureModelServerLauncher.java: "/featuremodel")
const ENDPOINT_ID = 'featuremodel';
const HTML_FILE = 'gui_model'+ '.' + ENDPOINT_ID ;

const loc = window.location.pathname;
const CLIENT_PATH = loc.substring(0, loc.lastIndexOf('/'));
const CLIENT_ABSOLUTE_EMF_FILE_PATH = resolve(join(CLIENT_PATH, '..', 'app', HTML_FILE));
const CLIENT_ID = 'sprotty';

// WebSocket URL: Server is listening on /featuremodel
const WEBSOCKET_URL = `ws://${HOST}:${PORT}/${ENDPOINT_ID}`;

let glspClient: GLSPClient;
let container: Container;
// default with reconnect every 30s -> bad !
// const wsProvider = new GLSPWebSocketProvider(webSocketUrl);
// Sets reconnect to 10 min
const wsProvider = new GLSPWebSocketProvider(WEBSOCKET_URL, {
    reconnecting: true,
    reconnectDelay: 10 * 60 * 1000  // 10 minutes in ms -> works !
});

// We do not need a reconnect since we are runnig the server on localhost
// const wsProvider = new GLSPWebSocketProvider(webSocketUrl, {
//     reconnecting: false,
// });

console.log(CLIENT_ABSOLUTE_EMF_FILE_PATH)

wsProvider.listen({ onConnection: initialize, onReconnect: reconnect, logger: console });

async function initialize(connectionProvider: MessageConnection, isReconnecting = false): Promise<void> {
    console.log('Initializing Feature Model GLSP Client...');
    console.log('Diagram Type:', DIAGRAM_TYPE);
    console.log('WebSocket URL:', WEBSOCKET_URL);
    console.log('Source URI:', CLIENT_ABSOLUTE_EMF_FILE_PATH);
    
    glspClient = new BaseJsonrpcGLSPClient({ id: ENDPOINT_ID, connectionProvider });
    container = createContainer({ 
        clientId: CLIENT_ID, 
        diagramType: DIAGRAM_TYPE, 
        glspClientProvider: async () => glspClient, 
        sourceUri: CLIENT_ABSOLUTE_EMF_FILE_PATH 
    });
    
    const actionDispatcher = container.get(GLSPActionDispatcher);
    const diagramLoader = container.get(DiagramLoader);

    if (!(window as any).__exitKeyBound) {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.ctrlKey && event.altKey && event.code === 'KeyE') {
                event.preventDefault();
                actionDispatcher.dispatch(ExitAction.create());
            } else if(event.ctrlKey && event.altKey && event.code == 'KeyS'){
                actionDispatcher.dispatch(SaveAction.create());
            }
        });
        (window as any).__exitKeyBound = true;
    }
    
    await diagramLoader.load({
        requestModelOptions: { isReconnecting },
        enableNotifications: true
    });

    if (isReconnecting) {
        const message = `Connection to the ${ENDPOINT_ID} glsp server got closed. Connection was successfully re-established.`;
        const timeout = 5000;
        const severity = 'WARNING';
        actionDispatcher.dispatchAll([
            StatusAction.create(message, { severity, timeout }), 
            MessageAction.create(message, { severity })
        ]);
        return;
    }
}

async function reconnect(connectionProvider: MessageConnection): Promise<void> {
    glspClient.stop();
    initialize(connectionProvider, true);
}
