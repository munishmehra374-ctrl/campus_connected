const Question = require("../models/Question");
const MentorshipThread = require("../models/MentorshipThread");
const Notification = require("../models/Notification");
const User = require("../models/User");

async function createNotification({ userId, type, title, body, meta }) {
    try {
        await Notification.create({ userId, type, title, body: body || "", meta: meta || {} });
    } catch (e) {
        console.error("Notification create failed:", e.message);
    }
}

/** Move legacy answers → publicAnswers and embedded threads → MentorshipThread docs */
async function migrateLegacyIfNeeded(questionDoc) {
    let dirty = false;
    const q = questionDoc;

    if (q.answers?.length) {
        for (const ans of q.answers) {
            const exists = (q.publicAnswers || []).some(
                (pa) =>
                    pa.seniorId?.toString() === ans.seniorId?.toString() &&
                    pa.content === ans.content
            );
            if (!exists) {
                q.publicAnswers = q.publicAnswers || [];
                q.publicAnswers.push({
                    seniorId: ans.seniorId,
                    seniorName: ans.seniorName || "Senior",
                    content: ans.content,
                    createdAt: ans.createdAt || new Date(),
                });
            }
        }
        q.answers = [];
        dirty = true;
    }

    if (q.threads?.length) {
        const juniorId = q.author?.id;
        for (const t of q.threads) {
            const already = await MentorshipThread.findOne({
                questionId: q._id,
                seniorId: t.seniorId,
                juniorId,
            });
            if (!already && juniorId) {
                await MentorshipThread.create({
                    questionId: q._id,
                    juniorId,
                    seniorId: t.seniorId,
                    seniorName: t.seniorName || "Senior",
                    linkedPublicAnswerId: null,
                    messages: (t.messages || []).map((m) => ({
                        senderId: m.senderId,
                        senderName: m.senderName,
                        senderRole: m.senderRole || "senior",
                        content: m.content,
                        deletedAt: null,
                        createdAt: m.createdAt || new Date(),
                    })),
                    isDeleted: false,
                });
            }
        }
        q.threads = [];
        dirty = true;
    }

    if (q.status === "Pending") {
        q.status = "Unsolved";
        dirty = true;
    }

    if (dirty) await q.save();
}

async function resolveMentorName(question, seniorId, providedName) {
    let name = (providedName || "").trim();
    if (name) return name;

    const pa = (question.publicAnswers || []).find(
        (a) => a.seniorId && a.seniorId.toString() === String(seniorId)
    );
    if (pa?.seniorName) return pa.seniorName;

    const thread = await MentorshipThread.findOne({
        questionId: question._id,
        seniorId,
        isDeleted: false,
    });
    if (thread?.seniorName) return thread.seniorName;

    const user = await User.findById(seniorId).select("name");
    return user?.name || "Mentor";
}

async function loadThreadsForQuestion(questionId, user) {
    if (!user) return [];
    const filter = {
        questionId,
        isDeleted: false,
        $or: [{ juniorId: user._id }, { seniorId: user._id }],
    };
    if (user.role === "admin") {
        delete filter.$or;
    }
    const sort = { updatedAt: -1, createdAt: -1 };
    const threads = await MentorshipThread.find(
        user.role === "admin" ? { questionId, isDeleted: false } : filter
    )
        .sort(sort)
        .lean();

    return threads.map((t) => ({
        ...t,
        messageCount: (t.messages || []).filter((m) => !m.deletedAt).length,
    }));
}

function serializePublicAnswers(answers) {
    return (answers || []).map((a) => ({
        _id: a._id,
        seniorId: a.seniorId,
        seniorName: a.seniorName,
        content: a.content,
        createdAt: a.createdAt,
    }));
}

function serializeQuestion(qDoc, user, threads) {
    const q = qDoc.toObject ? qDoc.toObject() : { ...qDoc };
    q.publicAnswers = serializePublicAnswers(q.publicAnswers || []);
    delete q.answers;
    delete q.threads;
    delete q.hiddenFor;

    q.mentorshipThreads = threads || [];
    q.threadCount = threads?.length || 0;

    if (q.solvedMeta?.solvedAt) {
        q.solvedByJunior = !!q.solvedMeta.solvedByJuniorId;
    }

    return q;
}

// JUNIOR: Ask Question
exports.askQuestion = async (req, res) => {
    try {
        const question = new Question({
            ...req.body,
            author: { id: req.user._id, name: req.user.name, role: req.user.role },
            status: "Unsolved",
            publicAnswers: [],
            solvedMeta: {},
        });
        await question.save();
        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.status(201).json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Error saving question" });
    }
};

exports.approveQuestion = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        await migrateLegacyIfNeeded(question);
        question = await Question.findByIdAndUpdate(req.params.id, { status: "Unsolved" }, { new: true });
        await createNotification({
            userId: question.author.id,
            type: "question_approved",
            title: "Your question was approved",
            body: `"${question.title}" is now visible to mentors.`,
            meta: { questionId: question._id },
        });
        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Approval failed" });
    }
};

/** SENIOR / ADMIN: post a public answer (visible to all) */
exports.addPublicAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: "Content is required" });

        if (req.user.role !== "senior" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only seniors can post public answers" });
        }

        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        await migrateLegacyIfNeeded(question);
        question = await Question.findById(req.params.id);

        if (question.status === "Solved") {
            return res.status(400).json({ message: "This question is marked solved" });
        }

        question.publicAnswers = question.publicAnswers || [];

        const already = question.publicAnswers.some(
            (a) => a.seniorId.toString() === req.user._id.toString()
        );
        if (already) {
            return res.status(400).json({ message: "You already posted a public answer on this question" });
        }

        question.publicAnswers.push({
            seniorId: req.user._id,
            seniorName: req.user.name,
            content: content.trim(),
            createdAt: new Date(),
        });
        await question.save();

        if (question.author.id.toString() !== req.user._id.toString()) {
            await createNotification({
                userId: question.author.id,
                type: "public_answer",
                title: "New mentor answer on your question",
                body: `${req.user.name} shared public guidance on "${question.title}".`,
                meta: { questionId: question._id, fromUserId: req.user._id },
            });
        }

        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.status(201).json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error posting answer" });
    }
};

/** JUNIOR: open private mentorship thread from a specific public answer */
exports.openPrivateThread = async (req, res) => {
    try {
        const { publicAnswerId } = req.body;
        if (!publicAnswerId) return res.status(400).json({ message: "publicAnswerId is required" });

        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        await migrateLegacyIfNeeded(question);
        question = await Question.findById(req.params.id);

        if (question.author.id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only the question author can open a private mentorship thread" });
        }

        question.publicAnswers = question.publicAnswers || [];

        let answer = question.publicAnswers.id(publicAnswerId);
        if (!answer) {
            answer = question.publicAnswers.find(
                (a) => a._id && a._id.toString() === String(publicAnswerId)
            );
        }
        if (!answer) return res.status(404).json({ message: "Public answer not found" });

        let thread = await MentorshipThread.findOne({
            questionId: question._id,
            juniorId: question.author.id,
            linkedPublicAnswerId: answer._id,
            isDeleted: false,
        });

        if (!thread) {
            thread = await MentorshipThread.create({
                questionId: question._id,
                juniorId: question.author.id,
                seniorId: answer.seniorId,
                seniorName: answer.seniorName,
                linkedPublicAnswerId: answer._id,
                messages: [],
                isDeleted: false,
            });

            await createNotification({
                userId: answer.seniorId,
                type: "mentorship_message",
                title: "Private mentorship chat opened",
                body: `${question.author.name} opened a private conversation with you about "${question.title}".`,
                meta: { questionId: question._id, threadId: thread._id, fromUserId: question.author.id },
            });
        }

        const threads = await loadThreadsForQuestion(question._id, req.user);
        const fullQ = await Question.findById(question._id);
        res.status(201).json(serializeQuestion(fullQ, req.user, threads));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error opening private thread" });
    }
};

exports.addThreadMessage = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: "Message content is required" });

        const thread = await MentorshipThread.findOne({
            _id: req.params.threadId,
            questionId: req.params.id,
            isDeleted: false,
        });
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        const uid = req.user._id.toString();
        const isJunior = thread.juniorId.toString() === uid;
        const isSenior = thread.seniorId.toString() === uid;
        if (req.user.role !== "admin" && !isJunior && !isSenior) {
            return res.status(403).json({ message: "You are not a participant in this private thread" });
        }

        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        if (question.status === "Solved") {
            return res.status(400).json({ message: "This question is solved; reopen it to continue messaging" });
        }

        thread.messages.push({
            senderId: req.user._id,
            senderName: req.user.name,
            senderRole: req.user.role,
            content: content.trim(),
            deletedAt: null,
            createdAt: new Date(),
        });
        thread.lastActivityAt = new Date();
        await thread.save();

        const recipientId = isJunior ? thread.seniorId : thread.juniorId;
        if (recipientId.toString() !== req.user._id.toString()) {
            await createNotification({
                userId: recipientId,
                type: "mentorship_message",
                title: "New message in your mentorship chat",
                body: `${req.user.name}: ${content.trim().slice(0, 80)}${content.length > 80 ? "…" : ""}`,
                meta: { questionId: question._id, threadId: thread._id, fromUserId: req.user._id },
            });
        }

        const threads = await loadThreadsForQuestion(question._id, req.user);
        const fullQ = await Question.findById(question._id);
        res.json(serializeQuestion(fullQ, req.user, threads));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error sending message" });
    }
};

/** Soft-delete entire private thread (junior or senior participant) */
exports.deleteThread = async (req, res) => {
    try {
        const thread = await MentorshipThread.findOne({
            _id: req.params.threadId,
            questionId: req.params.id,
            isDeleted: false,
        });
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        const uid = req.user._id.toString();
        const isJunior = thread.juniorId.toString() === uid;
        const isSenior = thread.seniorId.toString() === uid;
        if (req.user.role !== "admin" && !isJunior && !isSenior) {
            return res.status(403).json({ message: "Forbidden" });
        }

        thread.isDeleted = true;
        thread.deletedAt = new Date();
        await thread.save();

        const otherId = isJunior ? thread.seniorId : thread.juniorId;
        await createNotification({
            userId: otherId,
            type: "thread_deleted",
            title: "Mentorship conversation removed",
            body: `${req.user.name} deleted the private mentorship thread.`,
            meta: { questionId: thread.questionId, threadId: thread._id },
        });

        const question = await Question.findById(req.params.id);
        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Delete thread failed" });
    }
};

/** Soft-delete a single message (sender only, or admin) */
exports.deleteThreadMessage = async (req, res) => {
    try {
        const thread = await MentorshipThread.findOne({
            _id: req.params.threadId,
            questionId: req.params.id,
            isDeleted: false,
        });
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        const msg = thread.messages.id(req.params.messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });
        if (msg.deletedAt) {
            const q0 = await Question.findById(req.params.id);
            const threads0 = await loadThreadsForQuestion(q0._id, req.user);
            return res.json(serializeQuestion(q0, req.user, threads0));
        }

        if (req.user.role !== "admin" && msg.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        msg.deletedAt = new Date();
        msg.content = "";
        await thread.save();

        const question = await Question.findById(req.params.id);
        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Delete message failed" });
    }
};

exports.getQuestionById = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        await migrateLegacyIfNeeded(question);
        question = await Question.findById(req.params.id);
        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Error fetching question" });
    }
};

/** Any authenticated user: hide discussion from their feed only */
exports.hideQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const uid = req.user._id;
        question.hiddenFor = question.hiddenFor || [];
        const already = question.hiddenFor.some((id) => id.toString() === uid.toString());
        if (!already) {
            question.hiddenFor.push(uid);
            await question.save();
        }

        res.json({ message: "Discussion hidden from your feed", questionId: question._id });
    } catch (err) {
        res.status(500).json({ message: "Could not hide discussion" });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const filter = { hiddenFor: { $nin: [req.user._id] } };
        const questions = await Question.find(filter).sort({ createdAt: -1 });
        const out = [];
        for (const q of questions) {
            await migrateLegacyIfNeeded(q);
            const fresh = await Question.findById(q._id);
            const threads = await loadThreadsForQuestion(fresh._id, req.user);
            out.push(serializeQuestion(fresh, req.user, threads));
        }
        res.json(out);
    } catch (err) {
        res.status(500).json({ message: "Error fetching questions" });
    }
};

/** JUNIOR: mark question solved */
exports.markSolved = async (req, res) => {
    try {
        const { helpedBySeniorId, helpedBySeniorName } = req.body || {};
        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (question.author.id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the author can mark this solved" });
        }

        question.status = "Solved";
        question.solvedMeta = question.solvedMeta || {};
        question.solvedMeta.solvedAt = new Date();
        question.solvedMeta.solvedByJuniorId = req.user._id;
        if (helpedBySeniorId) {
            const mentorName = await resolveMentorName(
                question,
                helpedBySeniorId,
                helpedBySeniorName
            );
            question.solvedMeta.helpedBySeniorId = helpedBySeniorId;
            question.solvedMeta.helpedBySeniorName = mentorName;
        } else {
            question.solvedMeta.helpedBySeniorId = null;
            question.solvedMeta.helpedBySeniorName = null;
        }
        await question.save();

        if (helpedBySeniorId) {
            await createNotification({
                userId: helpedBySeniorId,
                type: "question_solved",
                title: "Question marked solved",
                body: `${question.author.name} marked "${question.title}" as solved.`,
                meta: { questionId: question._id, fromUserId: req.user._id },
            });
        }

        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Could not mark solved" });
    }
};

/** JUNIOR: reopen question */
exports.reopenQuestion = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (question.author.id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only the author can reopen" });
        }

        question.status = "Unsolved";
        question.solvedMeta = { solvedAt: null, solvedByJuniorId: null, helpedBySeniorId: null, helpedBySeniorName: null };
        await question.save();

        const threads = await loadThreadsForQuestion(question._id, req.user);
        res.json(serializeQuestion(question, req.user, threads));
    } catch (err) {
        res.status(500).json({ message: "Could not reopen" });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        await MentorshipThread.deleteMany({ questionId: req.params.id });
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: "Question deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

/** Legacy no-op — public answers use addPublicAnswer */
exports.answerQuestion = async (req, res) => {
    return exports.addPublicAnswer(req, res);
};

exports.createThread = async (req, res) => {
    return res.status(410).json({
        message: "Use POST /api/questions/:id/public-answers for public guidance, then the junior opens a private thread from that answer.",
    });
};
