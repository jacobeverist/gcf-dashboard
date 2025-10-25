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
import {
    DiscreteDataSourceNode,
    ScalarDataSourceNode,
} from './DataSourceNode';

// Export all node types for ReactFlow
export const nodeTypes = {
    // Transformers
    ScalarTransformer: ScalarTransformerNode,
    DiscreteTransformer: DiscreteTransformerNode,
    PersistenceTransformer: PersistenceTransformerNode,
    // Learning
    PatternPooler: PatternPoolerNode,
    PatternClassifier: PatternClassifierNode,
    // Temporal
    SequenceLearner: SequenceLearnerNode,
    ContextLearner: ContextLearnerNode,
    // Data Sources
    DiscreteDataSource: DiscreteDataSourceNode,
    ScalarDataSource: ScalarDataSourceNode,
};
