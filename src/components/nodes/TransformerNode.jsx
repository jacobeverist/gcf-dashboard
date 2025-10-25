import BaseNode from './BaseNode';

export function ScalarTransformerNode(props) {
    return (
        <BaseNode
            {...props}
            type="scalar"
            iconShape="triangle"
            iconColor="var(--block-scalar)"
        />
    );
}

export function DiscreteTransformerNode(props) {
    return (
        <BaseNode
            {...props}
            type="discrete"
            iconShape="triangle"
            iconColor="var(--block-discrete)"
        />
    );
}

export function PersistenceTransformerNode(props) {
    return (
        <BaseNode
            {...props}
            type="persistence"
            iconShape="triangle"
            iconColor="var(--block-persistence)"
        />
    );
}
