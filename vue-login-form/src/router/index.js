import { createRouter, createWebHashHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ResetPasswordPage from "../pages/ResetPasswordPage.vue";
import ShowResetPasswordPage from "../pages/ShowResetPasswordPage.vue";
import EmailVerificationPage from "../pages/EmailVerificationPage.vue";
import PublicHomePage from "../pages/PublicHomePage.vue";
import PlaceholderPage from "../pages/PlaceholderPage.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/public", component: PublicHomePage, meta: { title: "Public Home" } },
  { path: "/register", component: RegisterPage, meta: { title: "Register" } },
  { path: "/login", component: LoginPage, meta: { title: "Login" } },
  { path: "/reset-password", component: ResetPasswordPage, meta: { title: "Reset Password" } },
  { path: "/submitresetpassword", component: ShowResetPasswordPage, meta: { title: "Set New Password" } },
  { path: "/verifyemail", component: EmailVerificationPage, meta: { title: "Email Verification" } },
  { path: "/home", component: PlaceholderPage, meta: { title: "Home" } },
  { path: "/my-profile", component: PlaceholderPage, meta: { title: "My Profile" } },
  { path: "/revenue-report", component: PlaceholderPage, meta: { title: "Revenue Report" } },
  { path: "/manage-users", component: PlaceholderPage, meta: { title: "Manage Users" } },
  { path: "/manage-domains/add", component: PlaceholderPage, meta: { title: "Add Domain" } },
  { path: "/manage-domains/edit", component: PlaceholderPage, meta: { title: "Edit Domain" } },
  { path: "/manage-domains", component: PlaceholderPage, meta: { title: "Manage Domains" } },
  { path: "/manage-roles/edit", component: PlaceholderPage, meta: { title: "Edit Role" } },
  { path: "/manage-roles/add", component: PlaceholderPage, meta: { title: "Add Role" } },
  { path: "/manage-roles", component: PlaceholderPage, meta: { title: "Manage Roles" } },
  { path: "/settings", component: PlaceholderPage, meta: { title: "Settings" } },
  { path: "/stl-viewer", component: PlaceholderPage, meta: { title: "STL Viewer" } },
  { path: "/video-photo", component: PlaceholderPage, meta: { title: "Video Photo" } },
  { path: "/pusher-chat", component: PlaceholderPage, meta: { title: "Pusher Chat" } },
  { path: "/timesheet", component: PlaceholderPage, meta: { title: "Timesheet" } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
