import BaseNode from './BaseNode';

export function PatternPoolerNode(props) {
    return (
        <BaseNode
            {...props}
            type="pooler"
            iconShape="horizontal-rect"
            iconColor="var(--block-pooler)"
        />
    );
}

export function PatternClassifierNode(props) {
    return (
        <BaseNode
            {...props}
            type="classifier"
            iconShape="horizontal-rect"
            iconColor="var(--block-classifier)"
        />
    );
}
