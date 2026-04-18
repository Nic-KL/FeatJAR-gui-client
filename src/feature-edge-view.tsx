/** @jsx svg */
import { GEdge, GEdgeView, RenderingContext, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { Point } from 'sprotty-protocol';

@injectable()
export class MandatoryEdgeView extends GEdgeView {
    protected override renderAdditionals(
        edge: GEdge, segments: Point[], context: RenderingContext
    ): VNode[] {
        const additionals = super.renderAdditionals(edge, segments, context);
        if (segments.length === 0) return additionals;
        const p = segments[segments.length - 1];
        additionals.push(<circle cx={p.x} cy={p.y} r={5} class-fm-mandatory={true} />);
        return additionals;
    }
}

@injectable()
export class OptionalEdgeView extends GEdgeView {
    protected override renderAdditionals(
        edge: GEdge, segments: Point[], context: RenderingContext
    ): VNode[] {
        const additionals = super.renderAdditionals(edge, segments, context);
        if (segments.length === 0) return additionals;
        const p = segments[segments.length - 1];
        additionals.push(<circle cx={p.x} cy={p.y} r={5} class-fm-optional={true} />);
        return additionals;
    }
}

