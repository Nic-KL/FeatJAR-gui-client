/** @jsx svg */
import {
    GNode,
    RectangularNodeView,
    RenderingContext,
    svg
} from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

@injectable()
export class FeatureNodeView extends RectangularNodeView {

    override render(node: Readonly<GNode>, context: RenderingContext): VNode {
        const width = Math.max(node.bounds.width, 1);
        const height = Math.max(node.bounds.height, 1);

        const selected = node.selected;
        const strokeColor = selected ? 'blue' : 'black';
        const strokeWidth = selected ? 2 : 1;

        const isOr = node.cssClasses?.includes('node-or') || false;
        const isXor = node.cssClasses?.includes('node-xor') || false;
        const isAnd = node.cssClasses?.includes('node-and') || false;
        const isCardinality = node.cssClasses?.includes('node-cardinality') || false;

        const isAbstract = node.cssClasses?.includes('abstract') || false;
        const isConcrete = node.cssClasses?.includes('concrete') || false;

        const isMandatory = node.cssClasses?.includes('feature-mandatory') || false;
        const isOptional = node.cssClasses?.includes('feature-optional') || false;

        const showMandatoryMarker =
        isMandatory && this.hasIncomingEdgeOfType(node, 'edge-mandatory');

        const showOptionalMarker =
        isOptional && this.hasIncomingEdgeOfType(node, 'edge-optional');

        /*
         * AND / Cardinality groups: invisible.
         */
        if (isAnd || isCardinality) {
            return (
                <g>
                <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="transparent"
                stroke="none"
                pointerEvents="all"
                />
                {context.renderChildren(node)}
                </g>
            );
        }

        /*
         * OR / XOR groups: visible semicircle.
         * OR = filled, XOR = outlined only.
         */
        if (isOr || isXor) {
            return (
                <g>
                {this.renderSemicircle(width, height, strokeColor, strokeWidth, isOr)}
                {context.renderChildren(node)}
                </g>
            );
        }

        /*
         * Normal feature node.
         */
        return (
            <g>
            <rect
            x={0}
            y={0}
            width={width}
            height={height}
            style={{
                fill: isAbstract ? '#d3d3d3' : isConcrete ? '#add8e6' : 'white',
                stroke: strokeColor,
                strokeWidth: String(strokeWidth)
            }}
            />

            {showMandatoryMarker && (
                <circle
                cx={width / 2}
                cy={0}
                r={5}
                fill="black"
                stroke="black"
                stroke-width={1}
                />
            )}

            {showOptionalMarker && (
                <circle
                cx={width / 2}
                cy={0}
                r={5}
                fill="white"
                stroke="black"
                stroke-width={1.5}
                />
            )}

            {context.renderChildren(node)}
            </g>
        );
    }

    protected hasIncomingEdgeOfType(node: Readonly<GNode>, edgeType: string): boolean {
        return this.getIncomingEdges(node).some(edge => edge?.type === edgeType);
    }

    protected getIncomingEdges(node: Readonly<GNode>): ReadonlyArray<any> {
        const directIncomingEdges = (node as any).incomingEdges;

        if (Array.isArray(directIncomingEdges)) {
            return directIncomingEdges;
        }

        const rootReference = (node as any).root;
        const root = typeof rootReference === 'function' ? rootReference() : rootReference;

        if (!root) {
            return [];
        }

        const result: any[] = [];

        const visit = (element: any): void => {
            if (!element) {
                return;
            }

            if (this.isEdgeTargetingNode(element, node.id)) {
                result.push(element);
            }

            const children = element.children;
            if (Array.isArray(children)) {
                children.forEach(child => visit(child));
            }
        };

        visit(root);

        return result;
    }

    /**
     * Checks whether a model element is an edge pointing to the given node.
     */
    protected isEdgeTargetingNode(element: any, nodeId: string): boolean {
        const type = element.type;

        if (typeof type !== 'string' || !type.startsWith('edge')) {
            return false;
        }

        const targetId = element.targetId ?? element.target?.id;

        return targetId === nodeId;
    }

    /**
     * Half-ellipse filling the entire node bounds:
     * flat top edge across the full width, bulging down to the full height.
     */
    protected renderSemicircle(
        width: number,
        height: number,
        strokeColor: string,
        strokeWidth: number,
        filled: boolean
    ): VNode {
        const d = [
            `M 0 0`,
            `L ${width} 0`,
            `A ${width / 2} ${height} 0 0 1 0 0`,
            `Z`
        ].join(' ');

        return (
            <path
            d={d}
            fill={filled ? strokeColor : 'white'}
            stroke={strokeColor}
            stroke-width={strokeWidth}
            />
        );
    }
}
