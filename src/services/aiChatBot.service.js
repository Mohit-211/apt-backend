const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const openai = require('../config/openAi');
const { Conversation, AiChat } = require('../models');
const slugify = require("slugify");

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

const aiProposalChatBot = async (body) => {
    try {
        const { query, user, conversation_title, conversation_id, is_new } = body;
        let aiReply = ''
        const referenceDocs = await loadReferenceDocs(path.join(__dirname, '../sample'));
        const prompt = `
            You are a professional business proposal writer \
            and you have achive mastery in creating detailed, persuasive, and realistic business proposals. \
            ### Instructions: \
            1. Only generate a proposal if the input is a valid real-world proposal query or scenario. \
            2. If the input is a question, general topic, or irrelevant sentence (like How do you project Indian economy?), you should respond: \
                > I am a proposal writer AI. Please give a valid proposal query, not a question or topic or casual conversation. \
            3. Proposal must be set in realistic modern-day contexts (no fantasy or fictional creatures). \
            4. Avoid casual greetings or dialogues like Hi, Hello, How are you?
            5. The proposal should be **clear, structured, and detailed enough** so that any reader can easily understand the idea and plan. \
            ### Reference Proposals: \
            ${referenceDocs.map((doc, i) => `Proposal ${i + 1}:\n${doc}`).join('\n\n---\n\n')}
        `

        let conversationDoc = null;
        if (is_new == 1) {
            if (!query || !conversation_title) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields: query, conversation_title");
            }
            const titlePrompt = `
                Generate a short, clear and professional title (max 20 words) for a business proposal request.
                Avoid using generic words like "proposal", "request", or "query".
                Only return the title, no extra text. Skip adding extra effort for normal casual conversation like Hey!, Hello like casual conversation of humans.
            `;

            const titleResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                temperature: 0.5,
                messages: [
                    { role: 'system', content: titlePrompt },
                    { role: 'user', content: conversation_title }
                ],
            });

            let optimizedTitle = titleResponse.choices?.[0]?.message?.content?.trim();
            optimizedTitle = optimizedTitle?.replace(/^["']+|["']+$/g, '');
            const finalTitle = optimizedTitle || conversation_title?.trim()
            const chat_list_title = slugify(finalTitle, { lower: true, strict: true });
            conversationDoc = await Conversation.create({
                user_id: user.id,
                title: finalTitle,
                slug: chat_list_title
            });
        } else {

            if (!query || !conversation_id) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields: query, conversation_id");
            }
            conversationDoc = await Conversation.findOne({ where: { id: conversation_id } });
        }

        if (!query || !conversation_title) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields: query, conversation_title");
        }

        const previousChats = await AiChat.findAll({
            where: { conversation_id: conversationDoc.id },
            order: [['created_at', 'ASC']],
            attributes: ['conversation_id', 'message', 'query', 'short_message', 'long_message']
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

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.7,
            messages: messages,
        });

        aiReply = sanitizeText(response.choices?.[0]?.message?.content || "");
        if (!aiReply) {
            throw new ApiError(httpStatus.BAD_REQUEST, "AI failed to generate a response.");
        }

        await AiChat.bulkCreate([
            { conversation_id: conversationDoc.id, sender: 'user', message: aiReply, query: query },
        ]);

        const result = await Conversation.findOne({
            where: { id: conversationDoc.id, user_id: user.id },
            attributes: ['id', 'title', 'slug', 'user_id', 'created_at'],
            include: [
                {
                    model: AiChat,
                    as: 'chats',
                    attributes: ['id', 'conversation_id', 'message', 'created_at', 'query', 'short_message', 'long_message'],
                    required: false
                }
            ],
        });

        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, "Failed to fetch conversation result.");
        }

        return result;

    } catch (error) {
        console.error('❌ aiProposalChatBot Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};



const getConversationChats = async (body) => {
    try {
        const { conversation_id, user } = body;

        if (!conversation_id) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields: conversation_id");
        }

        const result = await Conversation.findOne({
            where: { id: conversation_id, user_id: user.id },
            attributes: ['id', 'title', 'slug', 'user_id', 'created_at'],
            include: [
                {
                    model: AiChat,
                    as: 'chats',
                    attributes: ['id', 'conversation_id', 'message', 'created_at', 'query', 'short_message', 'long_message', 'business_id', 'template_id'],
                    required: false
                }
            ]
        });

        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, "No chat found with this id");
        }

        return result;

    } catch (error) {
        console.error('❌ aiProposalChatBot Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};

const getAllConversations = async (body) => {
    try {
        const { user } = body;
        const conversationDocs = await Conversation.findAll({
            where: { user_id: user.id },
            attributes: ['id', 'title', 'slug', 'user_id', 'created_at'],
            order: [['id', 'DESC']]
        });

        if (!conversationDocs) {
            throw new ApiError(httpStatus.NOT_FOUND, "Failed to fetch conversations.");
        }

        return conversationDocs;

    } catch (error) {
        console.error('❌ aiProposalChatBot Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};

const deleteConversation = async (body, params) => {
    try {
        const { user } = body;
        const { conversation_id } = params;

        if (!conversation_id) {
            throw new ApiError(httpStatus.NOT_FOUND, "Please provide conversation_id inside params");
        }

        const conversationDoc = await Conversation.findOne({
            where: { user_id: user.id, id: conversation_id },
        });

        if (!conversationDoc) {
            throw new ApiError(httpStatus.NOT_FOUND, "No conversations found to delete.");
        }

        // Delete related AiChats
        await AiChat.destroy({
            where: { conversation_id: conversationDoc.id },
            force: true
        });

        // Delete Conversation
        await Conversation.destroy({
            where: { id: conversationDoc.id },
            force: true
        });

        return 'Conversation and associated chats deleted successfully.';

    } catch (error) {
        console.error('❌ deleteConversation Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};

const increateLengthOfProposal = async (body) => {
    try {
        const { previousProposal, user, chat_id, } = body;
        if (!chat_id || !previousProposal) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Please provide: chat_id and previousProposal ");
        }
        let aiReply = ''
        const prompt = `
            You are a professional business proposal writer.

            Below is an existing business proposal. Your task is to enhance it by:
            1. Making it more detailed and structured.
            2. Adding clarity, real-world examples, statistics, or market insights where applicable.
            3. Keeping the context and core idea the same.

            Avoid changing the original tone or topic.

            ---

            ### Enhanced, More Detailed Proposal:
        `
        let chatDoc = await AiChat.findOne({ where: { id: chat_id } });
        if (!chatDoc) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid chat_id");
        }
        const messages = [
            { role: 'system', content: prompt },
            { role: 'user', content: previousProposal }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.7,
            messages: messages,
        });

        aiReply = sanitizeText(response.choices?.[0]?.message?.content || "");
        if (!aiReply) {
            throw new ApiError(httpStatus.BAD_REQUEST, "AI failed to generate a response.");
        }

        chatDoc.long_message = aiReply;
        chatDoc.message = aiReply;
        await chatDoc.save()
        return aiReply;

    } catch (error) {
        console.error('❌ aiProposalChatBot Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};

const decreaseLengthOfProposal = async (body) => {
    try {
        const { previousProposal, user, chat_id, } = body;
        if (!chat_id || !previousProposal) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Please provide: chat_id and previousProposal ");
        }
        let aiReply = ''
        const prompt = `
            You are a professional business proposal writer.

            Below is an existing business proposal. Your task is to simplify and shorten it by:
            1. Making it more concise while keeping the key message intact.
            2. Removing unnecessary elaboration, fluff, or overly technical language.
            3. Maintaining professionalism and clarity.

            Avoid changing the original context or main objectives of the proposal.
            ---

            ### Shortened, Simplified Proposal:
        `;
        let chatDoc = await AiChat.findOne({ where: { id: chat_id } });
        if (!chatDoc) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid chat_id");
        }
        const messages = [
            { role: 'system', content: prompt },
            { role: 'user', content: previousProposal }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.7,
            messages: messages,
        });

        aiReply = sanitizeText(response.choices?.[0]?.message?.content || "");
        if (!aiReply) {
            throw new ApiError(httpStatus.BAD_REQUEST, "AI failed to generate a response.");
        }

        chatDoc.short_message = aiReply;
        chatDoc.message = aiReply;
        await chatDoc.save()
        return aiReply;

    } catch (error) {
        console.error('❌ aiProposalChatBot Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};

const updateMessage = async (body) => {
    try {
        const { user, conversation_id, message_id, edited_message } = body;
        if (!conversation_id || !message_id || !edited_message) {
            throw new ApiError(httpStatus.NOT_FOUND, "Please provide conversation_id, message_id, edited_message");
        }


        const conversationDoc = await Conversation.findOne({
            where: { user_id: user.id, id: conversation_id },
        });

        if (!conversationDoc) {
            throw new ApiError(httpStatus.NOT_FOUND, "No conversations found to delete.");
        }

        await AiChat.update(
            { message: edited_message },
            {
                where: {
                    id: message_id,
                    conversation_id: conversationDoc.id,
                },
            }
        );

        return { conversation_id, message_id, edited_message };

    } catch (error) {
        console.error('❌ deleteConversation Error:', error);
        throw new ApiError(
            error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error"
        );
    }
};

module.exports = {
    aiProposalChatBot,
    getConversationChats,
    getAllConversations,
    deleteConversation,
    increateLengthOfProposal,
    decreaseLengthOfProposal,
    updateMessage,
};