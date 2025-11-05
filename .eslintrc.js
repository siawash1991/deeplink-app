module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'prettier'
  ],
  plugins: [
    'jest'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Console is allowed in Node.js
    'no-console': 'off',

    // Allow function hoisting
    'no-use-before-define': ['error', { functions: false }],

    // Allow underscore dangle for MongoDB _id
    'no-underscore-dangle': ['error', { allow: ['_id'] }],

    // Prefer arrow functions but allow regular functions
    'prefer-arrow-callback': 'warn',

    // Allow async without await (for consistency)
    'require-await': 'off',

    // Allow console methods in development
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name=\'console\'][callee.property.name!=/^(log|warn|error|info)$/]',
        message: 'Unexpected console method.'
      }
    ],

    // Max line length
    'max-len': ['warn', {
      code: 100,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],

    // Allow param reassignment for Express middleware
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: ['req', 'res', 'next']
    }],

    // Consistent return not required (Express handlers)
    'consistent-return': 'off',

    // Allow multiple classes per file
    'max-classes-per-file': 'off',

    // Import order
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always'
    }]
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        // Allow longer lines in tests
        'max-len': 'off',
        // Allow any for tests
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
};
