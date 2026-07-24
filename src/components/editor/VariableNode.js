import { Node, mergeAttributes, InputRule } from "@tiptap/core";

export const VariableNode = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  selectable: true,
  draggable: true,
  atom: true, // Treated as a single unit, cannot type inside it

  addAttributes() {
    return {
      key: {
        default: "",
        parseHTML: element => element.getAttribute("data-variable-key"),
        renderHTML: attributes => {
          return { "data-variable-key": attributes.key };
        }
      },
      fallback: {
        default: "",
        parseHTML: element => element.getAttribute("data-variable-fallback"),
        renderHTML: attributes => {
          return { "data-variable-fallback": attributes.fallback };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable-key]"
      }
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const key = node.attrs.key;
    const fallback = node.attrs.fallback || key;
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "variable-pill bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-md px-1.5 py-0.5 font-sans font-semibold text-[10px] tracking-wide inline-flex items-center gap-1 select-none mx-0.5 cursor-pointer shadow-xs transition-all",
        title: `Variable: ${key}. Click to modify.`,
        "data-variable-key": key,
        "data-variable-fallback": fallback
      }),
      `{{${fallback}}}`
    ];
  },

  // Input rule to auto-convert {{VariableName}} typed by user into this pill
  addInputRules() {
    return [
      new InputRule({
        find: /\{\{\s*([\w]+)\s*\}\}$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;
          const variableKey = match[1];

          if (variableKey) {
            tr.replaceWith(
              start,
              end,
              this.type.create({
                key: variableKey,
                fallback: variableKey
              })
            );
          }
        }
      })
    ];
  }
});
