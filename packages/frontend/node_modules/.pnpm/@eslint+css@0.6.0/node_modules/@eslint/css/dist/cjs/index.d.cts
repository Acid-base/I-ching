export type SyntaxMatchError = import("@eslint/css-tree").SyntaxMatchError;
export type CssNode = import("@eslint/css-tree").CssNode;
export type CssNodePlain = import("@eslint/css-tree").CssNodePlain;
export type BlockPlain = import("@eslint/css-tree").BlockPlain;
export type Comment = import("@eslint/css-tree").Comment;
export type Lexer = import("@eslint/css-tree").Lexer;
export type SourceRange = import("@eslint/core").SourceRange;
export type SourceLocation = import("@eslint/core").SourceLocation;
export type SourceLocationWithOffset = import("@eslint/core").SourceLocationWithOffset;
export type File = import("@eslint/core").File;
export type TraversalStep = import("@eslint/core").TraversalStep;
export type TextSourceCode = import("@eslint/core").TextSourceCode;
export type VisitTraversalStep = import("@eslint/core").VisitTraversalStep;
export type FileProblem = import("@eslint/core").FileProblem;
export type DirectiveType = import("@eslint/core").DirectiveType;
export type RulesConfig = import("@eslint/core").RulesConfig;
export type StyleSheet = import("@eslint/css-tree").StyleSheet;
export type SyntaxConfig = import("@eslint/css-tree").SyntaxConfig;
export type Language = import("@eslint/core").Language;
export type OkParseResult = import("@eslint/core").OkParseResult<CssNodePlain> & {
    comments: Comment[];
    lexer: Lexer;
};
export type ParseResult = import("@eslint/core").ParseResult<CssNodePlain>;
export type FileError = import("@eslint/core").FileError;
export type CSSLanguageOptions = {
    /**
     * Whether to be tolerant of recoverable parsing errors.
     */
    tolerant?: boolean;
    /**
     * Custom syntax to use for parsing.
     */
    customSyntax?: SyntaxConfig;
};
export type AtrulePlain = import("@eslint/css-tree").AtrulePlain;
export type Identifier = import("@eslint/css-tree").Identifier;
export type FunctionNodePlain = import("@eslint/css-tree").FunctionNodePlain;
/**
 * CSS Language Object
 * @implements {Language}
 */
export class CSSLanguage implements Language {
    /**
     * The type of file to read.
     * @type {"text"}
     */
    fileType: "text";
    /**
     * The line number at which the parser starts counting.
     * @type {0|1}
     */
    lineStart: 0 | 1;
    /**
     * The column number at which the parser starts counting.
     * @type {0|1}
     */
    columnStart: 0 | 1;
    /**
     * The name of the key that holds the type of the node.
     * @type {string}
     */
    nodeTypeKey: string;
    /**
     * The visitor keys for the CSSTree AST.
     * @type {Record<string, string[]>}
     */
    visitorKeys: Record<string, string[]>;
    /**
     * The default language options.
     * @type {CSSLanguageOptions}
     */
    defaultLanguageOptions: CSSLanguageOptions;
    /**
     * Validates the language options.
     * @param {CSSLanguageOptions} languageOptions The language options to validate.
     * @throws {Error} When the language options are invalid.
     */
    validateLanguageOptions(languageOptions: CSSLanguageOptions): void;
    /**
     * Parses the given file into an AST.
     * @param {File} file The virtual file to parse.
     * @param {Object} [context] The parsing context.
     * @param {CSSLanguageOptions} [context.languageOptions] The language options to use for parsing.
     * @returns {ParseResult} The result of parsing.
     */
    parse(file: File, { languageOptions }?: {
        languageOptions?: CSSLanguageOptions;
    }): ParseResult;
    /**
     * Creates a new `CSSSourceCode` object from the given information.
     * @param {File} file The virtual file to create a `CSSSourceCode` object from.
     * @param {OkParseResult} parseResult The result returned from `parse()`.
     * @returns {CSSSourceCode} The new `CSSSourceCode` object.
     */
    createSourceCode(file: File, parseResult: OkParseResult): CSSSourceCode;
}
/**
 * CSS Source Code Object
 */
export class CSSSourceCode extends TextSourceCodeBase {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the instance.
     * @param {string} options.text The source code text.
     * @param {CssNodePlain} options.ast The root AST node.
     * @param {Array<Comment>} options.comments The comment nodes in the source code.
     * @param {Lexer} options.lexer The lexer used to parse the source code.
     */
    constructor({ text, ast, comments, lexer }: {
        text: string;
        ast: CssNodePlain;
        comments: Array<Comment>;
        lexer: Lexer;
    });
    /**
     * The AST of the source code.
     * @type {CssNodePlain}
     */
    ast: CssNodePlain;
    /**
     * The comment node in the source code.
     * @type {Array<Comment>|undefined}
     */
    comments: Array<Comment> | undefined;
    /**
     * The lexer for this instance.
     * @type {Lexer}
     */
    lexer: Lexer;
    /**
     * Returns the range of the given node.
     * @param {CssNodePlain} node The node to get the range of.
     * @returns {SourceRange} The range of the node.
     * @override
     */
    override getRange(node: CssNodePlain): SourceRange;
    /**
     * Returns an array of all inline configuration nodes found in the
     * source code.
     * @returns {Array<Comment>} An array of all inline configuration nodes.
     */
    getInlineConfigNodes(): Array<Comment>;
    /**
     * Returns directives that enable or disable rules along with any problems
     * encountered while parsing the directives.
     * @returns {{problems:Array<FileProblem>,directives:Array<Directive>}} Information
     *      that ESLint needs to further process the directives.
     */
    getDisableDirectives(): {
        problems: Array<FileProblem>;
        directives: Array<Directive>;
    };
    /**
     * Returns inline rule configurations along with any problems
     * encountered while parsing the configurations.
     * @returns {{problems:Array<FileProblem>,configs:Array<{config:{rules:RulesConfig},loc:SourceLocation}>}} Information
     *      that ESLint needs to further process the rule configurations.
     */
    applyInlineConfig(): {
        problems: Array<FileProblem>;
        configs: Array<{
            config: {
                rules: RulesConfig;
            };
            loc: SourceLocation;
        }>;
    };
    /**
     * Returns the parent of the given node.
     * @param {CssNodePlain} node The node to get the parent of.
     * @returns {CssNodePlain|undefined} The parent of the node.
     */
    getParent(node: CssNodePlain): CssNodePlain | undefined;
    /**
     * Traverse the source code and return the steps that were taken.
     * @returns {Iterable<CSSTraversalStep>} The steps that were taken while traversing the source code.
     */
    traverse(): Iterable<CSSTraversalStep>;
    #private;
}
declare namespace plugin {
    namespace meta {
        let name: string;
        let version: string;
    }
    namespace languages {
        let css: CSSLanguage;
    }
    let rules: {
        "no-empty-blocks": {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    recommended: boolean;
                    url: string;
                };
                messages: {
                    emptyBlock: string;
                };
            };
            create(context: any): {
                Block(node: any): void;
            };
        };
        "no-duplicate-imports": {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    recommended: boolean;
                    url: string;
                };
                messages: {
                    duplicateImport: string;
                };
            };
            create(context: any): {
                "Atrule[name=import]"(node: any): void;
            };
        };
        "no-invalid-at-rules": {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    recommended: boolean;
                    url: string;
                };
                messages: {
                    unknownAtRule: string;
                    invalidPrelude: string;
                    unknownDescriptor: string;
                    invalidDescriptor: string;
                    invalidExtraPrelude: string;
                    missingPrelude: string;
                };
            };
            create(context: any): {
                Atrule(node: any): void;
                "AtRule > Block > Declaration"(node: any): void;
            };
        };
        "no-invalid-properties": {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    recommended: boolean;
                    url: string;
                };
                messages: {
                    invalidPropertyValue: string;
                    unknownProperty: string;
                };
            };
            create(context: any): {
                "Rule > Block > Declaration"(node: any): void;
            };
        };
        "prefer-logical-properties": {
            meta: {
                type: "problem";
                fixable: "code";
                docs: {
                    description: string;
                    url: string;
                };
                schema: {
                    type: string;
                    properties: {
                        allowProperties: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        allowUnits: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                    additionalProperties: boolean;
                }[];
                defaultOptions: {
                    allowProperties: any[];
                    allowUnits: any[];
                }[];
                messages: {
                    notLogicalProperty: string;
                    notLogicalValue: string;
                    notLogicalUnit: string;
                };
            };
            create(context: any): {
                Declaration(node: any): void;
                Dimension(node: any): void;
            };
        };
        "use-layers": {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    url: string;
                };
                schema: {
                    type: string;
                    properties: {
                        allowUnnamedLayers: {
                            type: string;
                        };
                        requireImportLayers: {
                            type: string;
                        };
                        layerNamePattern: {
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                }[];
                defaultOptions: {
                    allowUnnamedLayers: boolean;
                    requireImportLayers: boolean;
                    layerNamePattern: string;
                }[];
                messages: {
                    missingLayer: string;
                    missingLayerName: string;
                    missingImportLayer: string;
                    layerNameMismatch: string;
                };
            };
            create(context: any): {
                "Atrule[name=import]"(node: any): void;
                Layer(node: any): void;
                "Atrule[name=layer]"(node: any): void;
                "Atrule[name=layer]:exit"(): void;
                Rule(node: any): void;
            };
        };
        "use-baseline": {
            meta: {
                type: "problem";
                docs: {
                    description: string;
                    recommended: boolean;
                    url: string;
                };
                schema: {
                    type: string;
                    properties: {
                        available: {
                            anyOf: ({
                                enum: string[];
                                type?: undefined;
                                minimum?: undefined;
                                maximum?: undefined;
                            } | {
                                type: string;
                                minimum: number;
                                maximum: number;
                                enum?: undefined;
                            })[];
                        };
                    };
                    additionalProperties: boolean;
                }[];
                defaultOptions: {
                    available: string;
                }[];
                messages: {
                    notBaselineProperty: string;
                    notBaselinePropertyValue: string;
                    notBaselineAtRule: string;
                    notBaselineType: string;
                    notBaselineMediaCondition: string;
                    notBaselineSelector: string;
                };
            };
            create(context: any): {
                "Atrule[name=supports]"(): void;
                "Atrule[name=supports] > AtrulePrelude > Condition"(node: any): void;
                "Rule > Block > Declaration"(node: any): void;
                "Atrule[name=supports]:exit"(): void;
                "Atrule[name=media] > AtrulePrelude > MediaQueryList > MediaQuery > Condition"(node: any): void;
                Atrule(node: any): void;
                "PseudoClassSelector,PseudoElementSelector"(node: any): void;
                NestingSelector(node: any): void;
            };
        };
    };
    namespace configs {
        namespace recommended {
            export let plugins: {};
            let rules_1: {
                readonly "css/no-empty-blocks": "error";
                readonly "css/no-duplicate-imports": "error";
                readonly "css/no-invalid-at-rules": "error";
                readonly "css/no-invalid-properties": "error";
                readonly "css/use-baseline": "error";
            };
            export { rules_1 as rules };
        }
    }
}
import { TextSourceCodeBase } from '@eslint/plugin-kit';
import { Directive } from '@eslint/plugin-kit';
/**
 * A class to represent a step in the traversal process.
 */
declare class CSSTraversalStep extends VisitNodeStep {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the step.
     * @param {CssNode} options.target The target of the step.
     * @param {1|2} options.phase The phase of the step.
     * @param {Array<any>} options.args The arguments of the step.
     */
    constructor({ target, phase, args }: {
        target: CssNode;
        phase: 1 | 2;
        args: Array<any>;
    });
    /**
     * The target of the step.
     * @type {CssNode}
     */
    target: CssNode;
}
import { VisitNodeStep } from '@eslint/plugin-kit';
export { plugin as default };
