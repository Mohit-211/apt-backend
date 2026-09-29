const {
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    Packer,
} = require("docx");

const { parseDocument } = require("htmlparser2");

function parseHtmlToDocxElements(html) {
    const doc = parseDocument(html);
    const elements = [];

    const processNode = (node, parentTag = null) => {
        if (node.type === "tag") {
            const tag = node.name.toLowerCase();

            switch (tag) {
                case "h1":
                case "h2":
                case "h3":
                    return new Paragraph({
                        heading: tag === "h1" ? HeadingLevel.HEADING_1 :
                            tag === "h2" ? HeadingLevel.HEADING_2 :
                                HeadingLevel.HEADING_3,
                        spacing: { after: 300 },
                        alignment: AlignmentType.LEFT,
                        children: getTextRuns(node.children, tag),
                    });

                case "p":
                    return new Paragraph({
                        children: getTextRuns(node.children),
                        spacing: { after: 200 },
                        alignment: AlignmentType.LEFT,
                    });

                case "br":
                    return new Paragraph({ children: [new TextRun({ break: 1 })] });

                case "hr":
                    return new Paragraph({
                        border: {
                            bottom: {
                                color: "auto",
                                space: 1,
                                value: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    });

                case "ul":
                case "ol":
                    return node.children
                        .filter(child => child.name === "li")
                        .map((li, i) =>
                            new Paragraph({
                                text: getTextContent(li.children),
                                bullet: tag === "ul" ? { level: 0 } : undefined,
                                numbering: tag === "ol"
                                    ? {
                                        reference: "numbering",
                                        level: 0,
                                    }
                                    : undefined,
                                spacing: { after: 100 },
                            })
                        );

                case "table":
                    return buildTable(node.children);

                default:
                    return new Paragraph({
                        children: getTextRuns(node.children),
                        spacing: { after: 200 },
                    });
            }
        }

        return null;
    };

    const getTextRuns = (nodes, parentTag = null) => {
        const runs = [];

        for (const node of nodes || []) {
            if (node.type === "text") {
                const text = node.data.trim();
                if (text) {
                    runs.push(
                        new TextRun({
                            text,
                            bold: ["strong", "b"].includes(parentTag) || ["h1", "h2", "h3"].includes(parentTag),
                            italics: ["em", "i"].includes(parentTag),
                            underline: ["u"].includes(parentTag) ? {} : undefined,
                            color: ["strong", "b"].includes(parentTag) ? "2E74B5" : undefined,
                            size: ["strong", "b"].includes(parentTag) ? 25 : 22,
                        })
                    );
                }
            } else if (node.type === "tag") {
                const tag = node.name.toLowerCase();
                runs.push(...getTextRuns(node.children || [], tag));
            }
        }
        return runs;
    };

    const getTextContent = (nodes) => {
        return nodes
            .map(node => {
                if (node.type === "text") return node.data.trim();
                if (node.type === "tag") return getTextContent(node.children);
                return "";
            })
            .join(" ");
    };

    const buildTable = (tableChildren) => {
        const rows = [];

        for (const row of tableChildren.filter(r => r.name === "tr")) {
            const cells = [];

            for (const cell of row.children.filter(c => c.name === "td" || c.name === "th")) {
                const isHeader = cell.name === "th";

                cells.push(
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: getTextRuns(cell.children || []),
                                bold: isHeader,
                            }),
                        ],
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    })
                );
            }

            rows.push(new TableRow({ children: cells }));
        }

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
        });
    };

    for (const child of doc.children) {
        const result = processNode(child);
        if (Array.isArray(result)) {
            elements.push(...result);
        } else if (result) {
            elements.push(result);
        }
    }

    return elements;
}

module.exports = {
    parseHtmlToDocxElements,
};
