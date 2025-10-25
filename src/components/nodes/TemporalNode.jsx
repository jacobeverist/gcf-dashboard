import BaseNode from './BaseNode';

export function SequenceLearnerNode(props) {
    return (
        <BaseNode
            {...props}
            type="sequence"
            iconShape="square"
            iconColor="var(--block-sequence)"
        />
    );
}

export function ContextLearnerNode(props) {
    return (
        <BaseNode
            {...props}
            type="context"
            iconShape="square"
            iconColor="var(--block-context)"
        />
    );
}
