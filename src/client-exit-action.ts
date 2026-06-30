import { Action } from '@eclipse-glsp/client';

export interface ExitAction extends Action {
    kind: typeof ExitAction.KIND;
}

export namespace ExitAction {
    export const KIND = 'exit';

    export function create(): ExitAction {
        console.log('Client Exit Handler called !');
        return { kind: KIND };
    }
}
