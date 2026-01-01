/*! `epoxy` grammar compiled for Highlight.js 11.11.1 */
(() => {
    hljs.registerLanguage("epoxy", function (hljs) {
        return {
            name: "Epoxy",
            case_insensitive: false,

            keywords: {
                keyword: [
                    "assign", "all", "fix", "update", "store", "make", "call", "give",
                    "check", "alt", "repeat", "until", "in", "to", "or", "and", "as",
                    "show", "error", "snafu", "skip", "halt", "method"
                ],
                type: [
                    "string", "int", "double", "bool", "array", "object", "null", "undefined"
                ],
                built_in: [
                    "input",
                    "filter", "map", "slice", "append", "includes", "join",
                    "upper", "lower", "size", "replace"
                ],
                literal: [
                    "true",
                    "false",
                    "null",
                    "undefined"
                ]
            },

            contains: [
                // $ Comments
                {
                    className: "comment",
                    begin: /\$/,
                    end: /$/,
                    relevance: 0
                },

                // Raw JavaScript blocks: @js :~ ... ~:
                {
                    className: "meta",
                    begin: /@js\s*:~/,
                    end: /~:/,
                    relevance: 10,
                    contains: [
                        {
                            className: "comment",
                            begin: /\/\//,
                            end: /$/
                        },
                        {
                            className: "comment",
                            begin: /\/\*/,
                            end: /\*\//
                        }
                    ]
                },

                // Special :input syntax
                {
                    className: "built_in",
                    begin: /:input\b/,
                    relevance: 10
                },

                // Method calls: method:type
                {
                    className: "title function",
                    begin: /method:/,
                    end: /\s/,
                    excludeEnd: true,
                    relevance: 5,
                    contains: [
                        {
                            className: "type",
                            match: /(string|int|double|bool|array|object|null|undefined)/
                        }
                    ]
                },

                // Backtick strings with interpolation [variable]
                {
                    className: "string",
                    begin: /`/,
                    end: /`/,
                    contains: [
                        {
                            className: "subst",
                            begin: /\[/,
                            end: /\]/,
                            contains: [
                                {
                                    className: "variable",
                                    match: /[a-zA-Z_][a-zA-Z0-9_]*/
                                }
                            ]
                        }
                    ]
                },

                // Regular strings (double and single quotes)
                {
                    className: "string",
                    begin: /"/,
                    end: /"/,
                    contains: [hljs.BACKSLASH_ESCAPE]
                },
                {
                    className: "string",
                    begin: /'/,
                    end: /'/,
                    contains: [hljs.BACKSLASH_ESCAPE]
                },

                // Numbers (integers and decimals)
                {
                    className: "number",
                    variants: [
                        { begin: /\b\d+\.\d+\b/ },  // decimals like 3.14
                        { begin: /\b\d+\b/ }         // integers like 42
                    ],
                    relevance: 0
                },

                // Lambda functions: [x] -> expression
                {
                    className: "function",
                    begin: /\[/,
                    end: /\]/,
                    contains: [
                        {
                            className: "params",
                            match: /[a-zA-Z_][a-zA-Z0-9_]*/
                        },
                        {
                            className: "operator",
                            match: /->/
                        }
                    ],
                    relevance: 5
                },

                // Built-in array/string methods
                {
                    className: "built_in",
                    begin: /\.(filter|map|slice|append|includes|join|upper|lower|size|replace)\b/,
                    relevance: 5
                },

                // Array/object access with curly braces {index}
                {
                    className: "property",
                    begin: /\{/,
                    end: /\}/,
                    contains: [
                        {
                            className: "number",
                            match: /\d+/
                        },
                        {
                            className: "variable",
                            match: /[a-zA-Z_][a-zA-Z0-9_]*/
                        }
                    ]
                },

                // Operators
                {
                    className: "operator",
                    begin: /===|!==|==|!=|>=|<=|>|<|->|\+|-|\*|\/|%|=/,
                    relevance: 0
                },

                // Variables and identifiers
                {
                    className: "variable",
                    match: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/,
                    relevance: 0
                }
            ]
        };
    });

    // Register aliases
    hljs.registerLanguage("epx", function (hljs) {
        return hljs.getLanguage("epoxy");
    });

    hljs.registerLanguage("epoxyjs", function (hljs) {
        return hljs.getLanguage("epoxy");
    });
})();