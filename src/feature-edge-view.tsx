/** @jsx svg */
import {
    GEdge,
    GEdgeView,
    GNode,
    RenderingContext,
//     svg
} from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { Point } from 'sprotty-protocol';

const CARDINALITY_RADIUS = 5;

@injectable()
export class FeatureCardinalityEdgeView extends GEdgeView {

    protected override renderLine(
        edge: Readonly<GEdge>,
        segments: Point[],
        context: RenderingContext
    ): VNode {
        return super.renderLine(edge, this.connectToCardinalityCircle(edge, segments), context);
    }

    protected override renderAdditionals(
        edge: GEdge,
        segments: Point[],
        context: RenderingContext
    ): VNode[] {
        return super.renderAdditionals(edge, this.connectToCardinalityCircle(edge, segments), context);
    }

    protected connectToCardinalityCircle(edge: Readonly<GEdge>, segments: Point[]): Point[] {
        if (segments.length < 2) {
            return segments;
        }

        const target = edge.target as GNode | undefined;
        if (!target || !target.bounds) {
            return segments;
        }

        const cssClasses = target.cssClasses ?? [];

        const hasCardinalityCircle =
        cssClasses.includes('feature-mandatory') ||
        cssClasses.includes('feature-optional');

        if (!hasCardinalityCircle) {
            return segments;
        }

        const bounds = target.bounds;
        const circleCenter = {
            x: bounds.x + bounds.width / 2,
            y: bounds.y
        };

        const routedSegments = segments.map(p => ({ ...p }));

        const previous = routedSegments[routedSegments.length - 2];

        const dx = previous.x - circleCenter.x;
        const dy = previous.y - circleCenter.y;
        const length = Math.sqrt(dx * dx + dy * dy) || 1;

        const circleBorderPoint = {
            x: circleCenter.x + (dx / length) * CARDINALITY_RADIUS,
            y: circleCenter.y + (dy / length) * CARDINALITY_RADIUS
        };

        routedSegments[routedSegments.length - 1] = circleBorderPoint;

        return routedSegments;
    }
}
