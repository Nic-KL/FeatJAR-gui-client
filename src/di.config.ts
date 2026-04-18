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

import { createWorkflowDiagramContainer } from './dependencies/workflow-diagram-module';
import {
    ConsoleLogger,
    EditMode,
    GEdge,
    GEdgeView,
    IDiagramOptions,
    LogLevel,
    STANDALONE_MODULE_CONFIG,
    TYPES,
    accessibilityModule,
    bindOrRebind,
    configureModelElement,
    createDiagramOptionsModule,
    overrideModelElement,
    toolPaletteModule,
    DefaultTypes,
    GNode
} from '@eclipse-glsp/client';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import '../css/diagram.css';
import { MandatoryEdgeView, OptionalEdgeView } from './feature-edge-view';
import { FeatureNodeView } from './feature-node-view';
// import { standaloneTaskEditorModule } from './features/direct-task-editing/standalone-task-editor-module';
import { getParameters } from './url-parameters';

export default function createContainer(options: IDiagramOptions): Container {
    const parameters = getParameters();
    if (parameters.readonly) {
        options.editMode = EditMode.READONLY;
    }

    const container = createWorkflowDiagramContainer(
        createDiagramOptionsModule(options),
    {
        add: [accessibilityModule],
        remove: toolPaletteModule
    },
    STANDALONE_MODULE_CONFIG
    );

    // COntext for configureModelElement / overrideModelElement
    const ctx = {
        bind: container.bind.bind(container),
        isBound: container.isBound.bind(container)
    };

    // own view for feature nodes which draws curves
    overrideModelElement(ctx, DefaultTypes.NODE, GNode, FeatureNodeView);

    // configureModelElement(ctx, 'feature:root', GNode, FeatureNodeView);
    // configureModelElement(ctx, 'feature:mandatory', GNode, FeatureNodeView);
    // configureModelElement(ctx, 'feature:optional', GNode, FeatureNodeView);
    // configureModelElement(ctx, 'feature:or', GNode, FeatureNodeView);
    // configureModelElement(ctx, 'feature:xor', GNode, FeatureNodeView);

    // Kanten
    configureModelElement(ctx, 'edge:mandatory', GEdge, MandatoryEdgeView);
    configureModelElement(ctx, 'edge:optional',  GEdge, OptionalEdgeView);
    overrideModelElement(ctx, 'edge', GEdge, GEdgeView);

    bindOrRebind(container, TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    bindOrRebind(container, TYPES.LogLevel).toConstantValue(LogLevel.warn);
    container.bind(TYPES.IMarqueeBehavior).toConstantValue({ entireEdge: true, entireElement: true });

    if (parameters.inversifyLog) {
        configureInversifyLogger(container);
    }
    return container;
}

function configureInversifyLogger(container: Container): void {
    const logOptions = {
        request: {
            bindings: {
                activated: true,
                cache: false,
                constraint: false,
                dynamicValue: false,
                factory: false,
                implementationType: true,
                onActivation: false,
                provider: false,
                scope: true,
                serviceIdentifier: true,
                type: false
            },
            serviceIdentifier: true,
            target: {
                metadata: true,
                name: false,
                serviceIdentifier: true
            }
        },
        time: true
    };

    const logger = makeLoggerMiddleware(logOptions);
    container.applyMiddleware(logger);
}
