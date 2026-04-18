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
        const width = Math.max(node.bounds.width, 100);
        const height = Math.max(node.bounds.height, 30);

        const selected = node.selected;
        const strokeColor = selected ? 'blue' : 'black';
        const strokeWidth = selected ? 2 : 1;

        const isOr = node.cssClasses?.includes('node-or') || false;
        const isXor = node.cssClasses?.includes('node-xor') || false;
        const isAnd = node.cssClasses?.includes('node-and') || false;
        const isMultiple = node.cssClasses?.includes('node-multiple') || false;

        const isAbstract = node.cssClasses?.includes('feature-abstract') || false;
        const isConcrete = node.cssClasses?.includes('feature-concrete') || false;

        // if(node.selected){
        //     console.log('Current Selection: ', node.cssClasses);
        // }

        if(node.selected && isAbstract){
            console.log('Abstract ?:', isAbstract);
        }
        if(node.selected && isConcrete){
            console.log('Concrete ?:', isConcrete);
        }
        if(node.selected && isOr){
            console.log('Or ?:', isOr);
        }
        if(node.selected && isXor){
            console.log('XOR ?:', isXor);
        }
        if(node.selected && isAnd){
            console.log('AND ?:', isAnd);
        }
        if(node.selected && isMultiple){
            console.log('MULTIPLE ?:', isMultiple);
        }

        if(isAnd){
            return (
                <g>
                <circle
                cx={width / 2}            // position the circle as needed
                cy={height / 2}
                aria-hidden="true"
                r={Math.max(width, height) / 2} // set radius to cover desired area
                fill="transparent"       // invisible but can capture events
                pointerEvents="all"      // ensure it receives pointer events
                // onPointerDown, onPointerMove, etc.
                />
                {context.renderChildren(node)}
                </g>
            );
        }

        if(!isOr && !isXor){
            // if(isAbstract){
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
                    {context.renderChildren(node)}
                </g>
            );
            // }
        }

        // console.log('rendered node type:', strokeColor, node.type, node.id, node.cssClasses);
        // console.log('rendered node type:', node.cssClasses, node.selected, strokeColor);

        return (
            <g>
            {isOr || isXor
                ? this.renderGroupedNodeShape(width, height, strokeColor, strokeWidth, isOr, isXor)
                : (
                    <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="white"
                    stroke={strokeColor}
                    stroke-width={strokeWidth}
                    />
                )
            }
            {context.renderChildren(node)}
            </g>
        );
    }

    protected renderGroupedNodeShape(
        width: number,
        height: number,
        strokeColor: string,
        strokeWidth: number,
        isOr: boolean,
        isXor: boolean
    ): VNode {
        const arcDepth = Math.min(18, height * 0.5);
        const sideBottomY = height - arcDepth;

        // OR / XOR form
        const outerD = [
            `M 0 0`,
            `L ${width} 0`,
            `L ${width} ${sideBottomY}`,
            `A ${width / 2} ${arcDepth} 0 0 1 0 ${sideBottomY}`,
            `L 0 0`,
            `Z`
        ].join(' ');


        const fillColor = isOr ? 'black' : 'white';

        return (
            <g>
            <path
            d={outerD}
            fill={fillColor}
            stroke={strokeColor}
            stroke-width={strokeWidth}
            />
            </g>
        );



    }
}
