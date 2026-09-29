/** @format */

const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Sequelize, QueryTypes, Op } = require("sequelize");
const moment = require("moment");
const randomize = require("randomatic");
const jwt = require("jsonwebtoken");

const sequelize = require("../config/central.db");
const {
	Admin,
	Role,
	User,
	UserAttachment,
	Proposal,
	ProposalAttachment,
	Calculator,
	ProposalViews,
	CalculatorViews,
	UserLoginTiming,
} = require("../models");
const validateEmail = require("../helpers/validateEmail");
const validatePassword = require("../helpers/validatePassword");
const tokenTypes = require("../config/tokens");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const {
	sendForgotPasswordOTP,
	sendUserCredentials,
	sendAdminCredentials,
	sendFreeTrialsCredentials,
	sendSubscriptionSuccessEmail,
	sendTrialExpirationEmail,
	sendAdminTrialExpirationEmail,
	sendUserSubscriptionExpiredEmail,
	sendAdminSubscriptionExpiredEmail,
	sendTrialActivationEmail,
} = require("./email.service");
const { orderBy } = require("lodash");

// const createAdminUser = async (userBody) => {
//   let salt = bcrypt.genSaltSync(10);
//   const userObj = {
//     name: userBody.name,
//     email_id: userBody.email,
//     password: bcrypt.hashSync(userBody.password, salt),
//     role_id: userBody.role_id,
//     // department_id: userBody.department_id,
//   };

//   const user = await Admin.create(userObj);

//   if (!user) {
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       "|=> Failed to create User <=|"
//     );
//   }
//   return user;
// };

const createAdminUser = async (reqBody) => {
	const password = Math.random().toString(36).substring(2, 12);
	let salt = bcrypt.genSaltSync(10);
	const adminObj = {
		name: reqBody.name,
		role_id: reqBody.role_id,
		email_id: reqBody.email,
		password: bcrypt.hashSync(password, salt),
	};
	const adminDoc = await Admin.create(adminObj);
	if (!adminDoc) {
		throw new ApiError(httpStatus.NOT_FOUND, "Unable to create admin");
	}

	let isSend = await sendAdminCredentials(reqBody.email, password);
	if (!isSend) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Unable to send Credentials to This Email"
		);
	}
	return adminDoc;
};

const getProfile = async (body) => {
	const { user } = body;
	let result = "";

	result = await Admin.findOne({
		include: [
			{
				model: Role,
				as: "admin_roles",
			},
		],
		where: { id: user?.id, is_active: true },
	});
	if (!result)
		throw new ApiError(httpStatus.BAD_REQUEST, "Failed to Get Profile.");

	return result;
};

const loginAdminUser = async (reqBody) => {
	const user = await Admin.findOne({ where: { email_id: reqBody.email } });

	if (!user) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			"User not found. Please check your email and try again."
		);
	}

	const validPass = await bcrypt.compare(reqBody.password, user.password);
	if (!validPass) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			"Invalid password. Please try again."
		);
	}

	const token = jwt.sign(
		{
			id: user.id,
			role_id: user.role_id,
			is_backlisted: false,
		},
		Buffer.from(config.jwt.secret, "hex"),
		{ algorithm: "HS256", expiresIn: "2d" }
	);
	const response = {
		name: user.name,
		email: user.email_id,
		token: token,
	};
	return response;
};

const resetAdminPassword = async (reqBody) => {
	const { old_password, confirm_password, user } = reqBody;

	const userDoc = await Admin.findByPk(user.id);

	if (!userDoc) {
		throw new ApiError(httpStatus.BAD_REQUEST, "|=> User Not Found. <=|");
	}

	const validPass = await bcrypt.compare(old_password, userDoc?.password);
	if (!validPass) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			"|=> Incorrect Old Password. <=|"
		);
	}

	let salt = bcrypt.genSaltSync(10);
	const userObj = {
		password: bcrypt.hashSync(confirm_password, salt),
	};

	const isUserPasswordUpdate = await Admin.update(userObj, {
		where: { id: user?.id },
	});

	if (!isUserPasswordUpdate) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"|=> Failed to Change Password. <=|"
		);
	}
	return "|=> Password Changed Successfully. <=|";
};

const sendOTP = async (email) => {
	const user = await Admin.findOne({ where: { email_id: email } });
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, "|=> Invalid Email <=|");
	}
	const generatedOTP = randomize("0", 6);
	await sendForgotPasswordOTP(email, generatedOTP);

	await Admin.update(
		{ otp: generatedOTP, is_otp_valid: true },
		{ where: { email_id: user.email_id } }
	);
	return true;
};

const verifyOTP = async (email, otp) => {
	if (!email || !otp) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			"|=> Please Enter Required Fields : [email_id, otp] <=|"
		);
	}

	const user = await Admin.findOne({ where: { email_id: email } });
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, "|=> Invalid Email <=|");
	}

	if (otp !== user.otp) {
		throw new ApiError(httpStatus.NOT_FOUND, "|=> Invalid OTP Entered <=|");
	}

	let isUpdate = await Admin.update(
		{
			is_otp_valid: false,
		},
		{
			where: { email_id: user.email_id },
		}
	);
	return isUpdate;
};

const forgotAdminPassword = async (reqBody) => {
	const { email, password, confirm_password } = reqBody;

	const user = await Admin.findOne({ where: { email_id: email } });
	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, "|=> Invalid Email <=|");
	}

	if (password !== confirm_password) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			"|=> New Password and Confirm Password Must Be Equal <=|"
		);
	}

	let salt = bcrypt.genSaltSync(10);
	const userObj = {
		password: bcrypt.hashSync(confirm_password, salt),
	};

	const isUserPasswordUpdate = await Admin.update(userObj, {
		where: { id: user?.id },
	});

	if (!isUserPasswordUpdate) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"|=> Failed to Change Password. <=|"
		);
	}
	return "|=> Password Changed Successfully. <=|";
};

const findAdminById = async (id) => {
	const adminDoc = await Admin.findOne({
		where: { id: id },
		include: [
			{
				model: Role,
				as: "admin_roles",
			},
		],
	});
	return adminDoc ? adminDoc : {};
};

const updateAdmin = async (reqBody) => {
	const adminDoc = await Admin.findOne({
		where: {
			id: reqBody.admin_id,
		},
	});

	if (
		reqBody.name &&
		reqBody.name !== "" &&
		typeof reqBody.name !== "undefined"
	) {
		adminDoc["name"] = reqBody.name;
	}

	if (
		reqBody.email &&
		reqBody.email !== "" &&
		typeof reqBody.email !== "undefined"
	) {
		adminDoc["email"] = reqBody.email;
	}
	if (
		reqBody.role_id &&
		reqBody.role_id !== "" &&
		typeof reqBody.role_id !== "undefined"
	) {
		adminDoc["role_id"] = reqBody.role_id;
	}

	await adminDoc.save();
	return adminDoc ? adminDoc : {};
};

const deleteAdmin = async (reqBody) => {
	const admin = await Admin.findOne({
		where: {
			id: reqBody.admin_id,
		},
	});
	if (!admin) {
		throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
	}
	await admin.destroy({
		where: {
			id: reqBody.admin_id,
			is_active: true,
		},
	});
};

const getAllUsers = async () => {
	try {
		const userDoc = await User.findAll({
			where: { is_active: 1 },
			order: [["created_at", "DESC"]],
			include: [
				{
					model: UserAttachment,
					as: "attachements",
				},
			],
		});

		if (!userDoc) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"|=> Failed to get all User <=|"
			);
		}

		return userDoc;
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
	}
};

const getUserById = async (id) => {
	const userDoc = await User.findOne({
		where: { id: id, is_active: true },
		include: [
			{
				model: UserAttachment,
				as: "attachements",
			},
		],
	});

	if (!userDoc)
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to Get User By Id"
		);
	return userDoc;
};

const deleteUser = async (reqBody) => {
	const userDoc = await User.findOne({ where: { id: reqBody.user_id } });
	if (!userDoc) {
		throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
	}
	await userDoc.destroy();

	// Delete associated proposalViewDocs
	const proposalViewDocs = await ProposalViews.findAll({
		where: { user_id: reqBody.user_id },
	});

	// Iterate through each instance and destroy it
	for (const proposalViewDoc of proposalViewDocs) {
		await proposalViewDoc.destroy();
	}

	// Delete associated proposalViewDocs
	const calculatorViewDocs = await CalculatorViews.findAll({
		where: { user_id: reqBody.user_id },
	});

	// Iterate through each instance and destroy it
	for (const calculatorViewDoc of calculatorViewDocs) {
		await calculatorViewDoc.destroy();
	}
	return userDoc;
};

const adminAddUser = async (name, email, id, subscription_status) => {
	// Check if the email already exists in the User table
	const existingUser = await User.findOne({
		where: { email },
	});
	if (existingUser) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
	}

	// Generate password and salt
	let salt = bcrypt.genSaltSync(10);
	const password = Math.random().toString(36).substring(2, 12);

	// Create new user
	const newUser = await User.create({
		name,
		email,
		password: bcrypt.hashSync(password, salt),
		subscription_status: subscription_status,
		created_by: id,
	});

	if (!newUser) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Unable to create user");
	}

	// Update user_status and is_trial_period based on subscription_status
	if (subscription_status === "PAID") {
		await newUser.update({
			user_status: "ACTIVATE",
			is_subscribed: true,
			is_trial_period: false,
		});
		await sendUserCredentials(email, password);
	} else if (subscription_status === "FREE TRIAL") {
		await newUser.update({
			user_status: "ACTIVATE TRIAL",
			is_subscribed: false,
			is_trial_period: true,
			trial_start_date: new Date(),
		});
		await sendFreeTrialsCredentials(email, password);
	}

	return newUser;
};

const getAllAdmins = async () => {
	try {
		const userDoc = await Admin.findAll({
			where: { is_active: true },
			include: [
				{
					model: Role,
					as: "admin_roles",
				},
			],
		});

		if (!userDoc) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"|=> Failed to get all User <=|"
			);
		}

		return userDoc;
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
	}
};

const getUserCount = async () => {
	const userCount = await User.count({
		where: {
			is_active: true,
		},
	});
	return userCount;
};

const getUserCountByMonth = async (inputYear) => {
	try {
		// Define all months
		const allMonths = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		// Determine the year to use (inputYear or current year)
		const yearToQuery = inputYear || new Date().getFullYear();

		// Fetch user count for each month from the database
		const userCountByMonth = await User.findAll({
			attributes: [
				[
					Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%M"),
					"month",
				],
				[Sequelize.fn("COUNT", "*"), "userCount"],
			],
			where: {
				created_at: {
					[Sequelize.Op.between]: [
						new Date(`${yearToQuery}-01-01`),
						new Date(`${yearToQuery}-12-31T23:59:59`),
					],
				},
			},
			group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%M")],
		});

		// Transform the result to an object with month names as keys
		const userCountByMonthMap = userCountByMonth.reduce(
			(acc, { dataValues }) => {
				const { month, userCount } = dataValues;
				acc[month] = userCount;
				return acc;
			},
			{}
		);

		// Create the final response with all months
		const response = allMonths.map((month) => ({
			month,
			userCount: userCountByMonthMap[month] || 0,
		}));

		console.log(response);

		return response;
	} catch (error) {
		console.error(error);
		throw new Error("Error retrieving user count by month");
	}
};

const getProposalCount = async () => {
	const userCount = await Proposal.count({
		where: {
			is_active: true,
		},
	});
	return userCount;
};

const getMostViewedProposal = async () => {
	try {
		const mostViewedStory = await Proposal.findOne({
			attributes: ["id", "title", "views_count"],
			order: [["views_count", "DESC"]],
			limit: 1,
		});

		return mostViewedStory;
	} catch (error) {
		// Handle errors here
		console.error("Error getting most viewed story:", error);
		throw error;
	}
};

const getMostViewedCalculator = async () => {
	try {
		const mostViewedStory = await Calculator.findOne({
			attributes: ["id", "calculator_name", "views_count"],
			order: [["views_count", "DESC"]],
			limit: 1,
		});

		return mostViewedStory;
	} catch (error) {
		// Handle errors here
		console.error("Error getting most viewed story:", error);
		throw error;
	}
};

const updateUserStatus = async (reqBody) => {
	try {
		const user = await User.findOne({
			where: { id: reqBody.user_id },
		});

		if (!user) {
			throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
		}

		// Check the new status from reqBody
		const newStatus = reqBody.user_status;

		// Update the user_status
		user.user_status = newStatus;

		// Update is_subscribed based on the user_status
		if (newStatus === "ACTIVATE") {
			user.is_subscribed = true;
			user.is_trial_period = false;
			user.subscription_status = "PAID";
			await sendSubscriptionSuccessEmail(user.email);
		} else if (newStatus === "DEACTIVATE") {
			user.is_subscribed = false;
			user.is_trial_period = false;
		} else if (newStatus === "ACTIVATE TRIAL") {
			user.is_subscribed = false;
			user.is_trial_period = true;
			user.subscription_status = "FREE TRIAL";
			user.trial_start_date = new Date();
			user.updated_at = moment();
			await sendTrialActivationEmail(user.email);
		}

		await user.save();

		return user;
	} catch (error) {
		// Handle errors appropriately
		console.error(error);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Internal Server Error"
		);
	}
};

const checkUserSubscriptionStatus = async () => {
	try {
		let oneYearFromNow = new Date();
		oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() - 1);

		console.log("date========>>", oneYearFromNow);

		const checkUser = await User.findAll({
			where: {
				updated_at: {
					[Op.lte]: oneYearFromNow,
				},
				is_subscribed: true,
			},
		});

		if (checkUser.length > 0) {
			await Promise.all(
				checkUser.map(async (user) => {
					await user.update(
						{ is_subscribed: false, user_status: "DEACTIVATE" },
						{
							where: {
								id: user.id,
								is_active: true,
							},
						}
					);

					// Send email to the user
					await sendUserSubscriptionExpiredEmail(user.email);

					// Send email to the admin
					await sendAdminSubscriptionExpiredEmail(user.name, user.email);
				})
			);
		}

		console.log("Expired Users: ", checkUser);
		return checkUser;
	} catch (error) {
		console.error(error);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Internal Server Error"
		);
	}
};

const checkAndProcessTrialExpiration = async () => {
	try {
		// 3 days ago from now
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		// Find all trial users whose registration was 3+ days ago
		const trialUsers = await User.findAll({
			where: {
				user_status: "ACTIVATE TRIAL",
				is_trial_period: true,
				created_at: {
					[Op.lte]: threeDaysAgo, // registered 3+ days ago
				},
			},
		});

		const expiredUsers = [];

		for (const user of trialUsers) {
			await user.update({
				is_trial_period: false,
				user_status: "DEACTIVATE",
			});

			expiredUsers.push(user);

			// Optionally, send emails
			await sendTrialExpirationEmail(user.email);
			await sendAdminTrialExpirationEmail(user.name, user.email);
		}

		console.log("Expired Users: ", expiredUsers);
		return expiredUsers;
	} catch (error) {
		console.error(error);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Internal Server Error"
		);
	}
};

const getLoginLogsOfUser = async (reqBody) => {
	const users = await User.findAll({
		where: {
			is_active: true,
		},
		include: [
			{
				model: UserLoginTiming,
				as: "user_login",
				where: {
					created_at: {
						[Op.and]: [
							sequelize.where(
								sequelize.fn("YEAR", sequelize.col("user_login.created_at")),
								reqBody.year
							),
							sequelize.where(
								sequelize.fn("MONTH", sequelize.col("user_login.created_at")),
								reqBody.month
							),
						],
					},
				},
				raw: true,
				required: false,
			},
		],
	});

	const userLoginLogs = users.map((user) => ({
		id: user.id,
		userName: user.name,
		userEmail: user.email,
		logincount: user.user_login ? user.user_login.length : 0,
	}));

	return userLoginLogs;
};

module.exports = {
	createAdminUser,
	loginAdminUser,
	resetAdminPassword,
	sendOTP,
	verifyOTP,
	forgotAdminPassword,
	updateAdmin,
	deleteAdmin,
	getAllUsers,
	getUserById,
	deleteUser,
	adminAddUser,
	getAllAdmins,
	getProfile,
	findAdminById,
	getUserCount,
	getProposalCount,
	getUserCountByMonth,
	getMostViewedProposal,
	updateUserStatus,
	getMostViewedCalculator,
	checkUserSubscriptionStatus,
	checkAndProcessTrialExpiration,
	getLoginLogsOfUser,
};
