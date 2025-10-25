/**
 * Parameter Validation Utilities
 *
 * Provides validation functions for block parameters
 */

/**
 * Check if a number is a power of 2
 */
export function isPowerOf2(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Validate a single parameter value
 * @param {*} value - The value to validate
 * @param {object} paramDef - Parameter definition with constraints
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateParameter(value, paramDef) {
    if (!paramDef) {
        return { valid: true };
    }

    // Type validation
    if (paramDef.type === 'number') {
        if (typeof value !== 'number' || isNaN(value)) {
            return { valid: false, error: 'Must be a valid number' };
        }

        // Range validation
        if (paramDef.min !== undefined && value < paramDef.min) {
            return { valid: false, error: `Must be at least ${paramDef.min}` };
        }
        if (paramDef.max !== undefined && value > paramDef.max) {
            return { valid: false, error: `Must be at most ${paramDef.max}` };
        }

        // Step validation
        if (paramDef.step !== undefined) {
            const steps = Math.round((value - (paramDef.min || 0)) / paramDef.step);
            const expectedValue = (paramDef.min || 0) + steps * paramDef.step;
            if (Math.abs(value - expectedValue) > 0.0001) {
                return { valid: false, error: `Must be a multiple of ${paramDef.step}` };
            }
        }

        // Custom validation: power of 2
        if (paramDef.powerOf2 && !isPowerOf2(value)) {
            return { valid: false, error: 'Must be a power of 2' };
        }

        // Custom validation: integer
        if (paramDef.integer && !Number.isInteger(value)) {
            return { valid: false, error: 'Must be an integer' };
        }
    }

    if (paramDef.type === 'boolean') {
        if (typeof value !== 'boolean') {
            return { valid: false, error: 'Must be true or false' };
        }
    }

    if (paramDef.type === 'string') {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Must be a string' };
        }

        if (paramDef.minLength !== undefined && value.length < paramDef.minLength) {
            return { valid: false, error: `Must be at least ${paramDef.minLength} characters` };
        }
        if (paramDef.maxLength !== undefined && value.length > paramDef.maxLength) {
            return { valid: false, error: `Must be at most ${paramDef.maxLength} characters` };
        }

        if (paramDef.pattern && !new RegExp(paramDef.pattern).test(value)) {
            return { valid: false, error: 'Invalid format' };
        }
    }

    if (paramDef.type === 'select') {
        if (!paramDef.options) {
            return { valid: true };
        }
        const validOptions = paramDef.options.map(opt => opt.value);
        if (!validOptions.includes(value)) {
            return { valid: false, error: 'Invalid option selected' };
        }
    }

    // Custom validator function
    if (paramDef.validate && typeof paramDef.validate === 'function') {
        try {
            const result = paramDef.validate(value);
            if (result === true || result === undefined) {
                return { valid: true };
            }
            if (typeof result === 'string') {
                return { valid: false, error: result };
            }
            return { valid: false, error: 'Validation failed' };
        } catch (error) {
            return { valid: false, error: 'Validation error' };
        }
    }

    return { valid: true };
}

/**
 * Validate all parameters for a block
 * @param {object} params - Current parameter values
 * @param {object} paramDefs - Parameter definitions
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateAllParameters(params, paramDefs) {
    const errors = {};
    let isValid = true;

    for (const [paramName, paramDef] of Object.entries(paramDefs)) {
        const value = params[paramName] ?? paramDef.default;
        const result = validateParameter(value, paramDef);

        if (!result.valid) {
            errors[paramName] = result.error;
            isValid = false;
        }
    }

    return { valid: isValid, errors };
}

/**
 * Cross-parameter validation
 * Check dependencies between parameters
 * @param {object} params - Current parameter values
 * @param {array} rules - Validation rules
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateParameterDependencies(params, rules) {
    const errors = {};
    let isValid = true;

    if (!rules || !Array.isArray(rules)) {
        return { valid: true, errors: {} };
    }

    for (const rule of rules) {
        const { condition, message } = rule;

        if (typeof condition === 'function') {
            try {
                if (!condition(params)) {
                    errors._general = message || 'Parameter constraint violated';
                    isValid = false;
                }
            } catch (error) {
                console.error('[Validation] Error in dependency rule:', error);
            }
        }
    }

    return { valid: isValid, errors };
}

/**
 * Sanitize parameter value to ensure it meets constraints
 * @param {*} value - The value to sanitize
 * @param {object} paramDef - Parameter definition
 * @returns {*} Sanitized value
 */
export function sanitizeParameter(value, paramDef) {
    if (!paramDef) {
        return value;
    }

    if (paramDef.type === 'number') {
        let num = parseFloat(value);

        if (isNaN(num)) {
            num = paramDef.default ?? 0;
        }

        // Clamp to range
        if (paramDef.min !== undefined) {
            num = Math.max(num, paramDef.min);
        }
        if (paramDef.max !== undefined) {
            num = Math.min(num, paramDef.max);
        }

        // Round to step
        if (paramDef.step !== undefined) {
            const steps = Math.round((num - (paramDef.min || 0)) / paramDef.step);
            num = (paramDef.min || 0) + steps * paramDef.step;
        }

        // Enforce power of 2
        if (paramDef.powerOf2) {
            num = Math.pow(2, Math.round(Math.log2(num)));
        }

        // Enforce integer
        if (paramDef.integer) {
            num = Math.round(num);
        }

        return num;
    }

    if (paramDef.type === 'boolean') {
        return Boolean(value);
    }

    if (paramDef.type === 'string') {
        let str = String(value);

        if (paramDef.maxLength !== undefined) {
            str = str.substring(0, paramDef.maxLength);
        }

        return str;
    }

    return value;
}

/**
 * Get parameter constraint description
 * @param {object} paramDef - Parameter definition
 * @returns {string} Human-readable constraint description
 */
export function getParameterConstraints(paramDef) {
    if (!paramDef) {
        return '';
    }

    const constraints = [];

    if (paramDef.type === 'number') {
        if (paramDef.min !== undefined && paramDef.max !== undefined) {
            constraints.push(`${paramDef.min} - ${paramDef.max}`);
        } else if (paramDef.min !== undefined) {
            constraints.push(`≥ ${paramDef.min}`);
        } else if (paramDef.max !== undefined) {
            constraints.push(`≤ ${paramDef.max}`);
        }

        if (paramDef.step !== undefined) {
            constraints.push(`step: ${paramDef.step}`);
        }

        if (paramDef.powerOf2) {
            constraints.push('power of 2');
        }

        if (paramDef.integer) {
            constraints.push('integer');
        }
    }

    if (paramDef.type === 'string') {
        if (paramDef.minLength !== undefined) {
            constraints.push(`min length: ${paramDef.minLength}`);
        }
        if (paramDef.maxLength !== undefined) {
            constraints.push(`max length: ${paramDef.maxLength}`);
        }
    }

    return constraints.join(', ');
}
