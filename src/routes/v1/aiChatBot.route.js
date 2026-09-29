const express = require('express');
const slugify = require("slugify");
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const openai = require('../../config/openAi');
const { Conversation, AiChat, Template, Business } = require('../../models');
const { aiChatBotController } = require('../../controllers');
const authMiddleware = require('../../middlewares/auth.middleware');
const responseWrapper = require("../../config/responseWrapper");

const router = express.Router();

router.post('/query', [authMiddleware.verifyAuthJWTToken], aiChatBotController.aiProposalChatBot);
router.post('/conversations/chats', [authMiddleware.verifyAuthJWTToken], aiChatBotController.getConversationChats);
router.get('/conversations', [authMiddleware.verifyAuthJWTToken], aiChatBotController.getAllConversations);
router.delete('/conversations/remove/:conversation_id', [authMiddleware.verifyAuthJWTToken], aiChatBotController.deleteConversation);

router.post('/conversations/chats/chat/details', [authMiddleware.verifyAuthJWTToken], aiChatBotController.increateLengthOfProposal);
router.post('/conversations/chats/chat/summarize', [authMiddleware.verifyAuthJWTToken], aiChatBotController.decreaseLengthOfProposal);
router.post('/conversations/chats/message/update', [authMiddleware.verifyAuthJWTToken], aiChatBotController.updateMessage);


//-------------------------------------------------------------------------------------

async function loadReferenceDocs(folderPath) {
    if (!fs.existsSync(folderPath)) {
        throw new ApiError(httpStatus.NOT_FOUND, "Reference document folder not found!");
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.docx')).slice(0, 5);
    const docs = [];

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const { value: text } = await mammoth.extractRawText({ path: filePath });
        docs.push(text.trim().slice(0, 2000));
    }

    console.log(`✅ Loaded ${docs.length} sample proposal(s).`);
    return docs;
}
function sanitizeText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => `<p>${line}</p>`)
        .join("");
}

const aiProposalChatBot1 = async (req, res) => {
    try {
        const { query, user, conversation_title, conversation_id, is_new } = req.body;

        if (!query) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Missing required field: query");
        }

        const referenceDocs = await loadReferenceDocs(path.join(__dirname, '../../sample'));
        let prompt = `
        You are a professional business proposal writer \
        and you have achieved mastery in creating detailed, persuasive, and realistic business proposals. \
        ### Instructions: \
        1. Only generate a proposal if the input is a valid real-world proposal query or scenario. \
        2. If the input is a question, general topic, or irrelevant sentence (like How do you project Indian economy?), you should respond: \
            > I am a proposal writer AI. Please give a valid proposal query, not a question or topic or casual conversation. \
        3. Proposal must be set in realistic modern-day contexts (no fantasy or fictional creatures). \
        4. Avoid casual greetings or dialogues like Hi, Hello, How are you? \
        5. The proposal should be **clear, structured, and detailed enough** so that any reader can easily understand the idea and plan. \
        ### Reference Proposals: \
        ${referenceDocs.map((doc, i) => `Proposal ${i + 1}:\n${doc}`).join('\n\n---\n\n')}
        `;

        let conversationDoc = null;
        if (is_new == 1) {
            if (!conversation_title) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Missing required field: conversation_title");
            }

            const titlePrompt = `
                Generate a short, clear and professional title (max 20 words) for a business proposal request.
                Avoid using generic words like "proposal", "request", or "query".
                Only return the title, no extra text.
            `;

            const titleResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // gpt-4o-mini, gpt-5-nano, gpt-5.1, gpt-5-mini 
                temperature: 0.5,
                messages: [
                    { role: 'system', content: titlePrompt },
                    { role: 'user', content: conversation_title }
                ],
            });

            let optimizedTitle = titleResponse.choices?.[0]?.message?.content?.trim();
            optimizedTitle = optimizedTitle?.replace(/^["']+|["']+$/g, '');
            const finalTitle = optimizedTitle || conversation_title?.trim();
            const chat_list_title = slugify(finalTitle, { lower: true, strict: true });

            conversationDoc = await Conversation.create({
                user_id: user.id,
                title: finalTitle,
                slug: chat_list_title
            });
        } else {
            if (!conversation_id) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Missing required field: conversation_id");
            }
            conversationDoc = await Conversation.findOne({ where: { id: conversation_id } });
        }

        if (!conversationDoc) {
            throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
        }

        const previousChats = await AiChat.findAll({
            where: { conversation_id: conversationDoc.id },
            order: [['created_at', 'ASC']],
            attributes: ['conversation_id', 'message', 'query', 'template_id', 'business_id']
        });
        const recentChats = previousChats.slice(-10);

        const messages = [
            { role: 'system', content: prompt },
            ...recentChats.flatMap(chat => ([
                { role: 'user', content: chat.query },
                { role: 'assistant', content: chat.message }
            ])),
            { role: 'user', content: query }
        ];

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.7,
            messages,
            stream: true,
        });

        let finalReply = "";

        for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
                finalReply += delta;
                res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
            }
        }

        finalReply = sanitizeText(finalReply);
        if (finalReply) {
            await AiChat.create({
                conversation_id: conversationDoc.id,
                sender: 'user',
                message: finalReply,
                query: query,
            });
        }
        const result = await Conversation.findOne({
            where: { id: conversationDoc.id, user_id: user.id },
            attributes: ['id', 'title', 'slug', 'user_id', 'created_at'],
            include: [
                {
                    model: AiChat,
                    as: 'chats',
                    attributes: ['id', 'conversation_id', 'message', 'created_at', 'query', 'short_message', 'long_message', 'template_id', 'business_id'],
                    required: false,
                    separate: true,
                    limit: 1,
                    order: [['id', 'DESC']]
                }
            ],
        });

        if (result) {
            res.write(`data: ${JSON.stringify({ type: 'final', token: result })}\n\n`);
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
    } catch (error) {
        console.error("❌ aiProposalChatBot Streaming Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                status: false,
                message: error.message || "Internal server error",
                data: null
            });
        }
    }
};

const aiProposalChatBot2 = async (req, res) => {
    try {
        const { query, user, conversation_title, conversation_id, is_new, template_id, business_id, auto_price } = req.body;

        if (!query || !template_id || !business_id) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Missing required field: query, template_id, business_id");
        }

        const referenceDocs = await loadReferenceDocs(path.join(__dirname, '../../sample'));
        let prompt = `
            You are a professional business proposal writer \
            and you have achieved mastery in creating detailed, persuasive, and realistic business proposals. \
            ### Instructions: \
            1. Only generate a proposal if the input is a valid real-world proposal query or scenario. \
            2. If the input is a question, general topic, or irrelevant sentence (like How do you project Indian economy?), you should respond: \
                > I am a proposal writer AI. Please give a valid proposal query, not a question or topic or casual conversation. \
            3. Proposal must be set in realistic modern-day contexts (no fantasy or fictional creatures). \
            4. Avoid casual greetings or dialogues like Hi, Hello, How are you? \
            5. The proposal should be **clear, structured, and detailed enough** so that any reader can easily understand the idea and plan. \
            ### Reference Proposals: \
            ${referenceDocs.map((doc, i) => `Proposal ${i + 1}:\n${doc}`).join('\n\n---\n\n')}
        `;

        let conversationDoc = null;
        if (is_new == 1) {
            if (!conversation_title) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Missing required field: conversation_title");
            }

            const titlePrompt = `
                Generate a short, clear and professional title (max 20 words) for a business proposal request.
                Avoid using generic words like "proposal", "request", or "query".
                Only return the title, no extra text.
            `;

            const titleResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // gpt-4o-mini, gpt-5-nano, gpt-5.1, gpt-5-mini 
                temperature: 0.5,
                messages: [
                    { role: 'system', content: titlePrompt },
                    { role: 'user', content: conversation_title }
                ],
            });

            let optimizedTitle = titleResponse.choices?.[0]?.message?.content?.trim();
            optimizedTitle = optimizedTitle?.replace(/^["']+|["']+$/g, '');
            const finalTitle = optimizedTitle || conversation_title?.trim();
            const chat_list_title = slugify(finalTitle, { lower: true, strict: true });

            conversationDoc = await Conversation.create({
                user_id: user.id,
                title: finalTitle,
                slug: chat_list_title
            });


            const templateDoc = await Template.findByPk(template_id);
            const businessDoc = await Business.findByPk(business_id);

            prompt = `
            You are a professional business proposal writer \
            and you have achieved mastery in creating detailed, persuasive, and realistic business proposals. \
            ### Instructions: \
            1. Only generate a proposal if the input is a valid real-world proposal query or scenario. \
            2. If the input is a question, general topic, or irrelevant sentence (like How do you project Indian economy?), you should respond: \
                > I am a proposal writer AI. Please give a valid proposal query, not a question or topic or casual conversation. \
            3. Proposal must be set in realistic modern-day contexts (no fantasy or fictional creatures). \
            4. Avoid casual greetings or dialogues like Hi, Hello, How are you? \
            5. The proposal should be **clear, structured, and detailed enough** so that any reader can easily understand the idea and plan. \
            6. Use Business information to make the proposal more accurate and personalized. \
            7. Use Proposal Template to make the proposal same structure but you need to update the proposal content as per user querymore accurate and personalized. \

            ### Business information
                Business Name: ${businessDoc.name}
                Location: ${businessDoc.location}
                Today's Date: ${new Date().toISOString().split('T')[0]}

            ### Proposal Template
                ${templateDoc.main_content}
            ***Use this ONLY for:
            - tone,
            - design style,
            - level of detail.

            ### PRICE HANDLING RULE
                ${auto_price && Number(auto_price) !== 0
                    ? `***Use this exact price for the pricing section: ${auto_price}.***`
                    : `***Suggest a reasonable, current market-based price according to industry standards and the specified location.***`}

            ***Write the full proposal according to all rules above***.
            `;
            // return res.send(prompt)
        } else {
            if (!conversation_id) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Missing required field: conversation_id");
            }
            conversationDoc = await Conversation.findOne({ where: { id: conversation_id } });
        }

        if (!conversationDoc) {
            throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
        }

        const previousChats = await AiChat.findAll({
            where: { conversation_id: conversationDoc.id },
            order: [['created_at', 'ASC']],
            attributes: ['conversation_id', 'message', 'query', 'template_id', 'business_id']
        });
        const recentChats = previousChats.slice(-10);

        const messages = [
            { role: 'system', content: prompt },
            ...recentChats.flatMap(chat => ([
                { role: 'user', content: chat.query },
                { role: 'assistant', content: chat.message }
            ])),
            { role: 'user', content: query }
        ];

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.7,
            messages,
            stream: true,
        });

        let finalReply = "";

        for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
                finalReply += delta;
                res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
            }
        }

        finalReply = sanitizeText(finalReply);
        if (finalReply) {
            await AiChat.create({
                conversation_id: conversationDoc.id,
                sender: 'user',
                message: finalReply,
                query: query,
                template_id: template_id,
                business_id: business_id
            });
        }
        const result = await Conversation.findOne({
            where: { id: conversationDoc.id, user_id: user.id },
            attributes: ['id', 'title', 'slug', 'user_id', 'created_at'],
            include: [
                {
                    model: AiChat,
                    as: 'chats',
                    attributes: ['id', 'conversation_id', 'message', 'created_at', 'query', 'short_message', 'long_message', 'business_id', 'template_id'],
                    required: false,
                    separate: true,
                    limit: 1,
                    order: [['id', 'DESC']]
                }
            ],
        });

        if (result) {
            res.write(`data: ${JSON.stringify({ type: 'final', token: result })}\n\n`);
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
    } catch (error) {
        console.error("❌ aiProposalChatBot Streaming Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                status: false,
                message: error.message || "Internal server error",
                data: null
            });
        }
    }
};

router.post('/stream', [authMiddleware.verifyAuthJWTToken], aiProposalChatBot1);

router.post('/stream1', [authMiddleware.verifyAuthJWTToken], aiProposalChatBot2);


//---------------------------------------------------------------------------------------------

module.exports = router;