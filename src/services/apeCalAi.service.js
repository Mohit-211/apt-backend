const httpStatus = require("http-status");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const ApiError = require("../utils/ApiError");
const openai = require('../config/openAi');
const puppeteer = require("puppeteer");
const { parseHtmlToDocxElements } = require("../utils/parseHTMLText");
const { Document, Paragraph, Packer, TextRun, Header, Footer, AlignmentType, ImageRun, PageNumber, BorderStyle, TabStopType, TabStopPosition } = require("docx");
const getProposalTemplate = require("../utils/proposalTemplate");
let businessData = [];

function loadExcelData(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new ApiError(httpStatus.NOT_FOUND, "Excel file not found!");
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    businessData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`✅ Loaded ${businessData.length} rows from Excel.`);
}

const EXCEL_FILE_PATH = path.join(__dirname, "advancedPriceExhibit.xlsx");
loadExcelData(EXCEL_FILE_PATH);

const getFeedback = async (body) => {
    try {
        const { type, data, location } = body;

        if (!type || !data || !location) throw new ApiError(httpStatus.BAD_REQUEST, "Please provide required fields : type, data and location");
        let typeArr = ["soft_skill_pricing_model", "one_time_all_day_workshop", "assesment_programs", "lms"]
        if (!typeArr.includes(type)) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid calculator type");

        const prompt = `
        You are an elite business strategist with 15+ years of experience in pricing optimization, market trends, and customer acquisition across diverse industries.
        
        Analyze the following pricing scenario using this business dataset: ${JSON.stringify(businessData.slice(0, 100))}
        
        Business input: ${JSON.stringify(data)}
        
        ✅ Your analysis must include:
        
        1. 📊 **Price Evaluation & Optimization:**
        - Is the current price competitive?
        - Recommend an **optimal price range** using market logic based on ${location}.
        - If possible, compare to benchmark data or typical ranges in similar industries.
        
        2. 🧠 **Discount Strategy:**
        - Assess if the current discount (${data.discount}%) is effective.
        - Suggest a **better discount bracket** that maximizes conversions and revenue.
        
        3. 🚀 **Customer Growth Plan (4 tips):**
        - List 4 **proven, data-backed** marketing or service strategies to increase customer reach and sales.
        - Include **digital and local outreach tips** if relevant.
        
        4. 💡 **Immediate Improvement Tip:**
        - Give one **high-impact suggestion** the business can implement today to improve pricing or customer traction.
        
        Respond using clear sections with bold headings. Use numbers, percentages, and specific tactics.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });
        const analysis = sanitizeText(response.choices[0].message.content);
        return analysis;

    } catch (error) {
        console.log(error)
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

function sanitizeText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => `<p>${line}</p>`)
        .join("");
}

const generateHTMLProposal = async (body) => {
    try {
        const { content } = body;

        if (!content) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Please provide content to generate the proposal.");
        }

        // const prompt = `
        // You're a senior business consultant. Based on the following information:
        // - AI Feedback Insights: ${content}

        // Generate a professional business proposal that includes:

        // 1. **Executive Summary**
        // 2. **Client's Needs Overview**
        // 3. **Pricing Summary** (show current and suggested price range)
        // 4. **Discount Strategy** (based on input)
        // 5. **Strategic Recommendations** (from AI feedback)
        // 6. **Conclusion & Call to Action**

        // Make the tone business-formal and persuasive. Format clearly with headings.
        // `;

        const prompt = `
            You're an expert business consultant and proposal writer. Based on the following AI feedback insights:

            - AI Feedback Insights: ${content}

            Generate a high-quality, well-structured, and persuasive business proposal with a business-formal tone. The proposal should be detailed, client-focused, and ready to be shared with executives or investors.

            Include the following clearly formatted sections:

            1. **Executive Summary**  
            - Give a concise overview of the proposal.
            - Explain the overall objective and value proposition.

            2. **Client's Needs Overview**  
            - Clearly identify the key challenges or needs.
            - Emphasize the importance of addressing them.

            3. **Pricing Summary**  
            - Compare current pricing with recommended pricing strategies.
            - Present realistic and competitive price ranges.

            4. **Discount Strategy**  
            - Provide a thoughtful discount plan.
            - Include rationale based on industry standards or insights.

            5. **Strategic Recommendations**  
            - Highlight actionable recommendations derived from the AI feedback.
            - Break down complex insights into clear, valuable actions.

            6. **Conclusion & Call to Action**  
            - Summarize the business opportunity.
            - End with a strong and persuasive call to action.

            Guidelines:
            - Word count: Aim for 800-1000 words.
            - Use formal, professional language.
            - Avoid fluff or repetition.
            - Format clearly with markdown-style headings (e.g., **bold** for emphasis).

            Output only the proposal content.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });
        function sanitizeText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/^#+\s+(.*)$/gm, "<h3>$1</h3>")
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => `<p>${line}</p>`)
                .join("");
        }
        const rawProposal = sanitizeText(response.choices[0].message.content);
        // return rawProposal

        let temp = getProposalTemplate(rawProposal)
        return temp

    } catch (error) {
        console.log(error);
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

async function createDocxFileFromHtml(rawProposal) {
    try {
        const elements = parseHtmlToDocxElements(rawProposal);
        if (elements) {
            const currentDate = new Date();
            const day = currentDate.getDate();
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const month = monthNames[currentDate.getMonth()];
            const year = currentDate.getFullYear();
            const formattedDate = `${day} ${month} ${year}`;

            const logoPath = path.join(__dirname, "../../public/uploads/images/logo.png");
            const logoImage = fs.readFileSync(logoPath);
            const headerChildren = [
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: logoImage,
                            transformation: {
                                width: 200,
                                height: 100,
                            },
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [new TextRun("")],
                    border: {
                        bottom: {
                            color: "2E74B5",
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 8,
                        },
                    },
                }),
                new Paragraph(" "),
            ];
            const infoHeader = [
                new Paragraph({
                    tabStops: [
                        {
                            type: TabStopType.RIGHT,
                            position: TabStopPosition.MAX,
                        },
                    ],
                    children: [
                        new TextRun({
                            text: "Automated Pricing Tool Pvt. ltd.",
                            size: 22,
                        }),
                        new TextRun({
                            text: `\t${formattedDate}`,
                            size: 22,
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "New York, USA, 145454",
                            size: 22,
                        }),
                    ],
                }),
                new Paragraph(" "),
            ]
            const doc = new Document({
                background: {
                    color: "F8FAFC",
                },
                sections: [
                    {
                        properties: {
                            titlePage: true,
                        },
                        headers: {
                            first: new Header({
                                children: [...headerChildren, ...infoHeader]
                            }),
                            default: new Header({
                                children: headerChildren,
                            }),
                        },
                        footers: {
                            default: new Footer({
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                children: ["© 2025 Automated Pricing Tool. All rights reserved. | Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES]
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        },
                        children: elements,
                    },
                ],
            });

            const buffer = await Packer.toBuffer(doc);
            const outputPath = path.join(
                __dirname,
                "../../public/uploads/docs",
                `docs-${Date.now()}.docx`
            );
            fs.writeFileSync(outputPath, buffer);
            return outputPath;
        }
        return ''
    } catch (error) {
        console.log(error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}

const downloadProposalDoc = async (body) => {
    try {
        const { content } = body;

        if (!content) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Please provide content to generate the proposal.");
        }

        // const htmlContent = getProposalTemplate(content);
        // const filePath = createDocxFileFromHtml(content);

        const filePath = createDocxFileFromHtmlPuppeter(content);

        if (!filePath) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate proposal document");
        }
        return filePath

    } catch (error) {
        console.log(error);
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};

async function createDocxFileFromHtmlPuppeter(htmlContent) {
    try {
        try {
            const pdfPath = path.join(__dirname, "../../public/uploads/docs/", "advance-price-proposal.pdf");
            await generatePdfFromHtml(htmlContent, pdfPath);
            return pdfPath
        } catch (error) {
            console.error("Error:", error.message);
            return 'Failed to generate pdf'
        }
    } catch (error) {
        console.log(error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}

async function generatePdfFromHtml(htmlContent, outputFilePath) {
    try {
        let executablePath;

        if (process.platform === 'win32') {
            executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        } else if (process.platform === 'linux') {
            executablePath = '/usr/bin/chromium-browser';
        } else if (process.platform === 'darwin') {
            executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        } else {
            // Fallback to default puppeteer Chromium
            executablePath = undefined;
        }
        const browser = await puppeteer.launch({
            headless: "new",
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        // await page.setContent(htmlContent, {
        //     waitUntil: 'domcontentloaded',
        //     timeout: 0,
        // });
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 0,
        });

        // Wait for fonts and images to load
        await page.evaluateHandle('document.fonts.ready');
        await page.waitForTimeout(1000);
        await page.pdf({
            path: outputFilePath,
            format: "A4",
            printBackground: true,
        });
        await browser.close();
    } catch (error) {
        console.error(error);
    }
}

// async function convertPdfToDocx(pdfFilePath, outputDocxPath) {
//     const form = new FormData();
//     form.append("file", fs.createReadStream(pdfFilePath));
//     form.append("inputformat", "pdf");
//     form.append("outputformat", "docx");

//     const response = await fetch("https://api.cloudconvert.com/v2/convert", {
//         method: "POST",
//         headers: {
//             Authorization: "Bearer YOUR_API_KEY_HERE",
//         },
//         body: form,
//     });

//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(result.message || "CloudConvert conversion failed");
//     }

//     const fileResponse = await fetch(result.data.result.url);
//     const fileBuffer = await fileResponse.buffer();
//     fs.writeFileSync(outputDocxPath, fileBuffer);
// }

const aiProposal = async (body) => {
    try {
        const { title } = body;

        if (!title) throw new ApiError(httpStatus.BAD_REQUEST, "Please provide required fields : title");

        const prompt = `
        You are an elite business proposal generalist with 15+ years of experience in pricing optimization, market trends, and customer acquisition across diverse industries.
        
        
        ✅ Your analysis must include:
        
        1. 📊 **Price Evaluation & Optimization:**
        - Is the current price competitive?
        - Recommend an **optimal price range** using market logic based on location.
        - If possible, compare to benchmark data or typical ranges in similar industries.
        
        2. 🧠 **Discount Strategy:**
        - Assess if the current discount is effective.
        - Suggest a **better discount bracket** that maximizes conversions and revenue.
        
        3. 🚀 **Customer Growth Plan (4 tips):**
        - List 4 **proven, data-backed** marketing or service strategies to increase customer reach and sales.
        - Include **digital and local outreach tips** if relevant.
        
        4. 💡 **Immediate Improvement Tip:**
        - Give one **high-impact suggestion** the business can implement today to improve pricing or customer traction.
        
        Respond using clear sections with bold headings. Use numbers, percentages, and specific tactics.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });
        const analysis = sanitizeText(response.choices[0].message.content);
        return analysis;

    } catch (error) {
        console.log(error)
        throw new ApiError(
            error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
};


module.exports = {
    getFeedback,
    generateHTMLProposal,
    downloadProposalDoc,
    aiProposal
};