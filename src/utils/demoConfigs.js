/**
 * Demo Network Configurations
 *
 * Each demo defines:
 * - name: Display name
 * - description: Short description
 * - blocks: Array of blocks to create { type, position, label }
 * - connections: Array of connections { source, target, type }
 */

/*
case 'ScalarTransformer':
    handle = network.add_scalar_transformer(
        name, min_val, max_val, num_s, num_as, num_t, seed
    );
    // min_val: 0, max_val: 1, num_s: 256, num_as: 40, num_t: 2, seed: 42,

case 'DiscreteTransformer':
    handle = network.add_discrete_transformer(
        name, num_v, num_s, num_t, seed
    );

case 'PersistenceTransformer':
    handle = network.add_persistence_transformer(
        name, min_val, max_val, num_s, num_as, max_step, num_t, seed
    );

case 'PatternPooler':
    handle = network.add_pattern_pooler(
        name, num_s, num_as, perm_thr, perm_inc, perm_dec,
        pct_pool, pct_conn, pct_learn, always_update, num_t, seed
    );

case 'PatternClassifier':
    handle = network.add_pattern_classifier(
        name, num_l, num_s, num_as, perm_thr, perm_inc, perm_dec,
        pct_pool, pct_conn, pct_learn, num_t, seed
    );

case 'SequenceLearner':
    handle = network.add_sequence_learner(
        name, num_c, num_spc, num_dps, num_rpd, d_thresh,
        perm_thr, perm_inc, perm_dec, num_t, always_update, seed
    );

case 'ContextLearner':
    handle = network.add_context_learner(
        name, num_c, num_spc, num_dps, num_rpd, d_thresh,
        perm_thr, perm_inc, perm_dec, num_t, always_update, seed
    );
*/


export const DEMOS = {
    sequence: {
        name: 'Sequence Learning',
        description: 'Learn and predict temporal sequences',
        blocks: [
            // {
            //     type: 'ScalarDataSource',
            //     position: {x: 100, y: 50},
            //     label: 'Sine Wave',
            //     params: {
            //         pattern: 'sine',
            //         amplitude: 0.5,
            //         frequency: 0.1,
            //         offset: 0.5,
            //         noise: 0,
            //     },
            // },
            {
                type: 'ScalarTransformer',
                position: {x: 100, y: 200},
                label: 'Input Scalar',
                params: {
                    min_val: 0.0,
                    max_val: 1.0,
                    num_s: 64,
                    num_as: 8,
                    num_t: 2,
                    seed: 42,
                },
            },
            {
                type: 'SequenceLearner',
                position: {x: 100, y: 350},
                label: 'Sequence Memory',
                params: {
                    //  mem_size: 256, history: 10,
                    num_c: 64,
                    num_spc: 10,
                    num_dps: 10,
                    num_rpd: 12,
                    d_thresh: 6,
                    perm_thr: 20,
                    perm_inc: 2,
                    perm_dec: 1,
                    num_t: 2,
                    always_update: false,
                    seed: 42
                },
            },
            // {
            //     type: 'PatternPooler',
            //     position: {x: 150, y: 400},
            //     label: 'Feature Pool',
            //     params: {
                    // num_s: 64,
                    // num_as: 8,
                    // perm_thr: 20,
                    // perm_inc: 2,
                    // perm_dec: 1,
                    // pct_pool: 0.8,
                    // pct_conn: 0.5,
                    // pct_learn: 0.3,
                    // always_update: false,
                    // num_t: 2,
                    // seed: 42,
                // },
            // },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 1, type: 'input'},
            // {sourceIndex: 1, targetIndex: 2, type: 'input'},
            // {sourceIndex: 1, targetIndex: 2, type: 'input'},
        ],
    },

    classification: {
        name: 'Classification',
        description: 'Pattern classification task',
        blocks: [
            {
                type: 'DiscreteTransformer',
                position: {x: 50, y: 100},
                label: 'Feature 1',
                params: {size: 128, bins: 16},
            },
            {
                type: 'DiscreteTransformer',
                position: {x: 250, y: 100},
                label: 'Feature 2',
                params: {size: 128, bins: 16},
            },
            {
                type: 'PatternPooler',
                position: {x: 150, y: 250},
                label: 'Feature Pool',
                params: {
                    // capacity: 256, learningRate: 0.01,
                    num_s: 1024,
                    num_as: 40,
                    perm_thr: 20,
                    perm_inc: 2,
                    perm_dec: 1,
                    pct_pool: 0.8,
                    pct_conn: 0.5,
                    pct_learn: 0.3,
                    always_update: false,
                    num_t: 2,
                    seed: 0,
                },
            },
            {
                type: 'PatternClassifier',
                position: {x: 150, y: 400},
                label: 'Classifier',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 2, type: 'input'},
            {sourceIndex: 1, targetIndex: 2, type: 'input'},
            {sourceIndex: 2, targetIndex: 3, type: 'input'},
        ],
    },

    context: {
        name: 'Context Learning',
        description: 'Learn contextual relationships',
        blocks: [
            {
                type: 'ScalarTransformer',
                position: {x: 100, y: 50},
                label: 'Input Signal',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'ContextLearner',
                position: {x: 100, y: 200},
                label: 'Context Memory',
                params: {num_c: 128, ctx_size: 128, capacity: 256},
            },
            {
                type: 'PersistenceTransformer',
                position: {x: 300, y: 50},
                label: 'Context Source',
                params: {size: 128, persistence: 0.9},
            },
            {
                type: 'PatternClassifier',
                position: {x: 100, y: 350},
                label: 'Output',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 1, type: 'input'},
            {sourceIndex: 2, targetIndex: 1, type: 'context'},
            {sourceIndex: 1, targetIndex: 3, type: 'input'},
        ],
    },

    pooling: {
        name: 'Feature Pooling',
        description: 'Pool features from multiple inputs',
        blocks: [
            {
                type: 'ScalarTransformer',
                position: {x: 50, y: 50},
                label: 'Input A',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'ScalarTransformer',
                position: {x: 200, y: 50},
                label: 'Input B',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'ScalarTransformer',
                position: {x: 350, y: 50},
                label: 'Input C',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'PatternPooler',
                position: {x: 200, y: 200},
                label: 'Feature Pooler',
                params: {capacity: 256, learningRate: 0.01},
            },
            {
                type: 'SequenceLearner',
                position: {x: 200, y: 350},
                label: 'Temporal Integration',
                params: {num_c: 256, mem_size: 512, history: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 3, type: 'input'},
            {sourceIndex: 1, targetIndex: 3, type: 'input'},
            {sourceIndex: 2, targetIndex: 3, type: 'input'},
            {sourceIndex: 3, targetIndex: 4, type: 'input'},
        ],
    },

    // Data Source Demos

    scalarSource: {
        name: 'Scalar Data Source',
        description: 'Simple scalar source driving a transformer',
        blocks: [
            {
                type: 'ScalarDataSource',
                position: {x: 100, y: 50},
                label: 'Sine Wave',
                params: {
                    pattern: 'sine',
                    amplitude: 10,
                    frequency: 0.1,
                    offset: 0,
                    noise: 0,
                },
            },
            {
                type: 'ScalarTransformer',
                position: {x: 100, y: 200},
                label: 'Scalar Transform',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'PatternClassifier',
                position: {x: 100, y: 350},
                label: 'Classifier',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 1, type: 'input'},
            {sourceIndex: 1, targetIndex: 2, type: 'input'},
        ],
    },

    discreteSource: {
        name: 'Discrete Data Source',
        description: 'Simple discrete source driving a transformer',
        blocks: [
            {
                type: 'DiscreteDataSource',
                position: {x: 100, y: 50},
                label: 'Sequential States',
                params: {
                    pattern: 'sequential',
                    numCategories: 5,
                    changeEvery: 3,
                    noise: 0,
                },
            },
            {
                type: 'DiscreteTransformer',
                position: {x: 100, y: 200},
                label: 'Discrete Transform',
                params: {size: 128, bins: 16},
            },
            {
                type: 'PatternClassifier',
                position: {x: 100, y: 350},
                label: 'Classifier',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 1, type: 'input'},
            {sourceIndex: 1, targetIndex: 2, type: 'input'},
        ],
    },

    sensorFusion: {
        name: 'Sensor Fusion',
        description: 'Multiple scalar sources simulating sensors',
        blocks: [
            {
                type: 'ScalarDataSource',
                position: {x: 50, y: 50},
                label: 'Temperature',
                params: {
                    pattern: 'sine',
                    amplitude: 15,
                    frequency: 0.042,
                    offset: 20,
                    noise: 2.0,
                },
            },
            {
                type: 'ScalarDataSource',
                position: {x: 200, y: 50},
                label: 'Humidity',
                params: {
                    pattern: 'sine',
                    amplitude: 20,
                    frequency: 0.033,
                    offset: 60,
                    noise: 3.0,
                },
            },
            {
                type: 'ScalarDataSource',
                position: {x: 350, y: 50},
                label: 'Pressure',
                params: {
                    pattern: 'randomWalk',
                    amplitude: 1.0,
                    frequency: 0.1,
                    offset: 1013,
                    noise: 0.5,
                },
            },
            {
                type: 'ScalarTransformer',
                position: {x: 50, y: 200},
                label: 'Temp Transform',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'ScalarTransformer',
                position: {x: 200, y: 200},
                label: 'Humidity Transform',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'ScalarTransformer',
                position: {x: 350, y: 200},
                label: 'Pressure Transform',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'PatternPooler',
                position: {x: 200, y: 350},
                label: 'Sensor Fusion',
                params: {capacity: 256, learningRate: 0.01},
            },
            {
                type: 'PatternClassifier',
                position: {x: 200, y: 500},
                label: 'Weather Prediction',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 3, type: 'input'},
            {sourceIndex: 1, targetIndex: 4, type: 'input'},
            {sourceIndex: 2, targetIndex: 5, type: 'input'},
            {sourceIndex: 3, targetIndex: 6, type: 'input'},
            {sourceIndex: 4, targetIndex: 6, type: 'input'},
            {sourceIndex: 5, targetIndex: 6, type: 'input'},
            {sourceIndex: 6, targetIndex: 7, type: 'input'},
        ],
    },

    timeSeries: {
        name: 'Time Series Learning',
        description: 'Data source driving temporal sequence learning',
        blocks: [
            {
                type: 'ScalarDataSource',
                position: {x: 100, y: 50},
                label: 'Time Series Data',
                params: {
                    pattern: 'sine',
                    amplitude: 10,
                    frequency: 0.05,
                    offset: 0,
                    noise: 1.0,
                },
            },
            {
                type: 'ScalarTransformer',
                position: {x: 100, y: 200},
                label: 'Feature Extract',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'SequenceLearner',
                position: {x: 100, y: 350},
                label: 'Temporal Memory',
                params: {num_c: 128, mem_size: 256, history: 10},
            },
            {
                type: 'PatternClassifier',
                position: {x: 100, y: 500},
                label: 'Prediction',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 1, type: 'input'},
            {sourceIndex: 1, targetIndex: 2, type: 'input'},
            {sourceIndex: 2, targetIndex: 3, type: 'input'},
        ],
    },

    multiModal: {
        name: 'Multi-Modal Input',
        description: 'Both scalar and discrete sources combined',
        blocks: [
            {
                type: 'ScalarDataSource',
                position: {x: 50, y: 50},
                label: 'Continuous Signal',
                params: {
                    pattern: 'sine',
                    amplitude: 10,
                    frequency: 0.1,
                    offset: 0,
                    noise: 0.5,
                },
            },
            {
                type: 'DiscreteDataSource',
                position: {x: 250, y: 50},
                label: 'Category Signal',
                params: {
                    pattern: 'sequential',
                    numCategories: 4,
                    changeEvery: 5,
                    noise: 0,
                },
            },
            {
                type: 'ScalarTransformer',
                position: {x: 50, y: 200},
                label: 'Scalar Path',
                params: {size: 128, threshold: 0.5},
            },
            {
                type: 'DiscreteTransformer',
                position: {x: 250, y: 200},
                label: 'Discrete Path',
                params: {size: 128, bins: 16},
            },
            {
                type: 'PatternPooler',
                position: {x: 150, y: 350},
                label: 'Combine Features',
                params: {capacity: 256, learningRate: 0.01},
            },
            {
                type: 'PatternClassifier',
                position: {x: 150, y: 500},
                label: 'Joint Classifier',
                params: {capacity: 256, numClasses: 10},
            },
        ],
        connections: [
            {sourceIndex: 0, targetIndex: 2, type: 'input'},
            {sourceIndex: 1, targetIndex: 3, type: 'input'},
            {sourceIndex: 2, targetIndex: 4, type: 'input'},
            {sourceIndex: 3, targetIndex: 4, type: 'input'},
            {sourceIndex: 4, targetIndex: 5, type: 'input'},
        ],
    },
};

/**
 * Get demo configuration by key
 * @param {string} demoKey - Demo key (sequence, classification, context, pooling)
 * @returns {object|null} Demo configuration
 */
export function getDemoConfig(demoKey) {
    return DEMOS[demoKey] || null;
}

/**
 * Get all demo keys
 * @returns {string[]} Array of demo keys
 */
export function getDemoKeys() {
    return Object.keys(DEMOS);
}

/**
 * Get demo descriptions for UI
 * @returns {object} Map of demo key to description
 */
export function getDemoDescriptions() {
    const descriptions = {};
    Object.keys(DEMOS).forEach((key) => {
        descriptions[key] = DEMOS[key].description;
    });
    return descriptions;
}
