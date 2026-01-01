hljs.registerLanguage("epoxy", function (hljs) {
    return {
        name: "Epoxy",
        case_insensitive: true,

        keywords: {
            keyword: [
                "assign", "all", "fix", "update", "store", "make", "call", "give",
                "check", "alt", "repeat", "until", "in", "to", "or", "and", "as",
                "show", "error", "snafu", "skip", "halt",
            ],
            type: [
                "string", "int", "double", "bool", "array", "object", "null", "undefined"
            ],
            built_in: [
                "show",
                "snafu",
                "input"
            ],
            literal: [
                "true",
                "false",
                "null"
            ]
        },

        contains: [
            // Numbers
            {
                className: "number",
                begin: /\b\d+(\.\d+)?\b/
            },

            // Strings
            {
                className: "string",
                begin: /"/,
                end: /"/
            },

            // $ comments
            {
                className: "comment",
                begin: /\$/,
                end: /$/
            },

            // Operators
            {
                className: "operator",
                begin: /[+\-*/%]=?|==|!=| ===| !==|>|<| <=| >=|->/,
            },


            {
                className: "built_in",
                begin: /:input\b/,
                relevance: 10
            },
            {
                className: "built_in",
                begin: /method:\b/,
                relevance: 10
            },
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
            {
                className: "built_in",
                begin: /\.(filter|map|slice|append|includes|join|upper|lower|size|replace)\b/,
                relevance: 5
            },

        ]
    };
});