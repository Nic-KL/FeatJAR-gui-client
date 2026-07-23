import { Action } from '@eclipse-glsp/client';

export interface SaveAction extends Action {
    kind: typeof SaveAction.KIND;
}

export namespace SaveAction {
    export const KIND = 'save';

    export function create(): SaveAction {
        console.log('Client Save Handler called !');
        return { kind: KIND };
    }
}
