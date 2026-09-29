const sequelize = require("../config/central.db");
// console.log("sequilize===>",sequelize)

const OTP = require("./otp.model");
const User = require("./user.model");
const UserToken = require("./userToken.model");
const UserAttachment = require("./userAttachment.model");
const UserLoginTiming = require("./userLoginTiming.model");

const ContactUs = require("./contactUs.model");
const Faq = require("./faq.model");

const Calculator = require("./calculator.model");
const CalculatorAttachment = require("./calculatorAttachment.model");
const CalculatorViews = require("./calculatorView.model");

const Role = require("./role.model");
const Admin = require("./admin.model");

const Category = require("./category.model");
const ProposalCategory = require("./proposalCategory.model");
const Proposal = require("./proposal.model");
const ProposalAttachment = require("./proposalAttachement.model");
const ProposalCalculation = require("./proposalCalculation.model");
const ProposalViews = require("./proposalView.model");

const Payment = require("./payment.model");

const HomePageContent = require("./homePageContent.model");
const BannerContent = require("./banner.model");
const SocialLogins = require("./socialLogins.model")

const Conversation = require('./conversations.model')
const AiChat = require('./aiChat.model');

const Business = require('./business.model');
const Template = require('./template.model');

module.exports = {
  OTP,
  User,
  UserToken,
  UserAttachment,
  UserLoginTiming,
  ContactUs,
  Faq,
  Calculator,
  Role,
  Admin,
  Payment,
  CalculatorAttachment,
  Category,
  ProposalCategory,
  Proposal,
  ProposalAttachment,
  ProposalCalculation,
  HomePageContent,
  CalculatorViews,
  ProposalViews,
  BannerContent,
  SocialLogins,

  Conversation,
  AiChat,
  Business,
  Template,
};

async function init() {
  User.hasMany(UserToken, { foreignKey: "user_id", as: "tokens" });
  UserToken.belongsTo(User, { foreignKey: "user_id", as: "token_user" });

  User.hasMany(UserLoginTiming, { foreignKey: "user_id", as: "user_login" });
  UserLoginTiming.belongsTo(User, { foreignKey: "user_id", as: "login_user" });

  User.hasMany(UserAttachment, { foreignKey: "user_id", as: "attachements" });
  UserAttachment.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Role.hasMany(Admin, { foreignKey: "id", as: "roles_admin" });
  Admin.belongsTo(Role, { foreignKey: "role_id", as: "admin_roles" });

  Proposal.belongsToMany(Category, {
    through: ProposalCategory,
    foreignKey: "proposal_id",
  });

  Category.belongsToMany(Proposal, {
    through: ProposalCategory,
    foreignKey: "category_id",
  });

  Conversation.hasMany(AiChat, {
    foreignKey: 'conversation_id',
    as: 'chats'
  })
  // sequelize
  //   .sync({ alter: true })
  //   .then((result) => console.log("Altering Table Completed."))
  //   .catch((err) =>
  //     console.log("Failed to alter all table into database:", err)
  //   );
}

init();
