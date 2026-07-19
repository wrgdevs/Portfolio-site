export default {
    rules: {
        "block-no-empty": true,
        "color-no-invalid-hex": true,
        "declaration-block-no-duplicate-custom-properties": true,
        "declaration-block-no-duplicate-properties": [
            true,
            { ignore: ["consecutive-duplicates-with-different-values"] }
        ],
        "font-family-no-duplicate-names": true,
        "function-calc-no-unspaced-operator": true,
        "keyframe-block-no-duplicate-selectors": true,
        "no-duplicate-at-import-rules": true,
        "property-no-unknown": true,
        "selector-pseudo-class-no-unknown": true,
        "selector-pseudo-element-no-unknown": true,
        "unit-no-unknown": true
    }
};
