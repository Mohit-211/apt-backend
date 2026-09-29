// Cal input Referancs
// {
//     "type": "soft_skill_pricing_model", // soft_skill_pricing_model, one_time_all_day_workshop, assesment_programs, lms
//     "data": {
//         "Model Type": "Soft Skill Pricing Model", // Soft Skill Pricing Model, One Time All Day Workshop, Assesment Programs, LMS
//         "Participants": 10,
//         "AUP": 200,
//         "Travel Cost": 5,
//         "Discount": 5,
//         "Location": "New York"
//     }
// }

// {
//     "type": "one_time_all_day_workshop", // soft_skill_pricing_model, one_time_all_day_workshop, assesment_programs, lms
//     "data": {
//         "Model Type": "One Time All Day Workshop", // Soft Skill Pricing Model, One Time All Day Workshop, Assesment Programs, LMS
//         "Participants": 20,
//         "Per Hour Rate:": 180,
//         "travelCost": 5,
//         "Discount": 5,
//         "Location": "New York"
//     }
// }

// {
//     "type": "assesment_programs", // soft_skill_pricing_model, one_time_all_day_workshop, assesment_programs, lms
//     "data": {
//         "Model Type": "Assesment Programs", // Soft Skill Pricing Model, One Time All Day Workshop, Assesment Programs, LMS
//         "assesmentType": "Emotional Intelligence Combo Assessment(1-200)" // Emotional Intelligence Combo Assessment(1-200), Emotional Intelligence Combo Assessment(201-299), Emotional Intelligence Combo Assessment(300+), Leadership 360 Assessment, Group Executive Report,  Sales Assessment, Sales Leader Assessment, Organizational Assessment
//         "Participants": 100,
//         "Per Assessment Fee:": 120,
//         "Assessment Fee": 100,
//         "Discount": 5,
//         "Location": "New York"
//     }
// }

// {
//     "type": "lms", // soft_skill_pricing_model, one_time_all_day_workshop, assesment_programs, lms
//     "data": {
//         "Model Type": "LMS", // Soft Skill Pricing Model, One Time All Day Workshop, Assesment Programs, LMS
//         "Participants": 200,
//         "AUP": 4,
//         "Discount": 5,
//         "Location": "New York"
//     }
// }


const { Paragraph, TextRun, HeadingLevel } = require("docx");

const { parseDocument } = require("htmlparser2");

function parseHtmlToDocxElements(html) {
    const doc = parseDocument(html);
    const elements = [];

    const processNode = (node) => {
        if (node.type === "tag") {
            const tagName = node.name.toLowerCase();

            switch (tagName) {
                case "h1":
                case "h2":
                case "h3":
                    return new Paragraph({
                        heading: tagName === "h1"
                            ? HeadingLevel.HEADING_1
                            : tagName === "h2"
                                ? HeadingLevel.HEADING_2
                                : HeadingLevel.HEADING_3,
                        children: getTextRuns(node.children),
                    });

                case "p":
                    return new Paragraph({
                        children: getTextRuns(node.children),
                    });

                default:
                    return new Paragraph({
                        children: getTextRuns(node.children),
                    });
            }
        }
        return null;
    };

    const getTextRuns = (nodes) => {
        return nodes
            .filter((n) => n.type === "text" || n.type === "tag")
            .map((child) => {
                if (child.type === "text") {
                    return new TextRun({ text: child.data, break: 1 });
                }
                if (child.type === "tag") {
                    const tag = child.name.toLowerCase();
                    const content = child.children?.[0]?.data || "";

                    return new TextRun({
                        text: content,
                        bold: tag === "strong" || tag === "b",
                        italics: tag === "em" || tag === "i",
                    });
                }
            });
    };

    for (const child of doc.children) {
        const paragraph = processNode(child);
        if (paragraph) {
            elements.push(paragraph);
        }
    }

    return elements;
}

module.exports = {
    parseHtmlToDocxElements
}
