import {
    ScalarTransformerNode,
    DiscreteTransformerNode,
    PersistenceTransformerNode,
} from './TransformerNode';
import {
    PatternPoolerNode,
    PatternClassifierNode,
} from './LearningNode';
import {
    SequenceLearnerNode,
    ContextLearnerNode,
} from './TemporalNode';

// Export all node types for ReactFlow
export const nodeTypes = {
    ScalarTransformer: ScalarTransformerNode,
    DiscreteTransformer: DiscreteTransformerNode,
    PersistenceTransformer: PersistenceTransformerNode,
    PatternPooler: PatternPoolerNode,
    PatternClassifier: PatternClassifierNode,
    SequenceLearner: SequenceLearnerNode,
    ContextLearner: ContextLearnerNode,
};
