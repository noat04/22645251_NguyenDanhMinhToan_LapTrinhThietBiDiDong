"use strict";
//18. Create a static class MathUtil with methods add(), subtract(), multiply(), divide().
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtil = void 0;
class MathUtil {
    static add(a, b) {
        return a + b;
    }
    static subtract(a, b) {
        return a - b;
    }
    static multiply(a, b) {
        return a * b;
    }
    static divide(a, b) {
        if (b === 0) {
            throw new Error("Division by zero is not allowed.");
        }
        return a / b;
    }
}
exports.MathUtil = MathUtil;
