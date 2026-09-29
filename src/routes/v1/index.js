const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const faqRoute = require("./faq.route");
const contactUsRoute = require("./contactUs.route");
const calculatorRoute = require("./calculator.route");
const adminRoute = require("./admin.route");
const roleRoute = require("./role.route");
const paymentRoute = require("./payment.route");
const ProposalRoute = require("./proposal.route");
const ContentRoute = require("./content.route");
const CategoryRoute = require("./category.route")
const apeCalAiRoute = require("./apeCalAi.route")
const aiChatBotRoute = require("./aiChatBot.route")
const businessRoute = require("./business.route")
const templateRoute = require("./template.route")

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/faq",
    route: faqRoute,
  },
  {
    path: "/contactUs",
    route: contactUsRoute,
  },
  {
    path: "/calculator",
    route: calculatorRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/role",
    route: roleRoute,
  },
  {
    path: "/payment",
    route: paymentRoute,
  },
  {
    path: "/proposal",
    route: ProposalRoute,
  },
  {
    path: "/content",
    route: ContentRoute,
  },
  {
    path: "/category",
    route: CategoryRoute,
  },
  {
    path: "/ape",
    route: apeCalAiRoute,
  },
  {
    path: "/aichat",
    route: aiChatBotRoute,
  },
  {
    path: "/business",
    route: businessRoute,
  },
  {
    path: "/templates",
    route: templateRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
