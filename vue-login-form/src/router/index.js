import { createRouter, createWebHashHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ResetPasswordPage from "../pages/ResetPasswordPage.vue";
import ShowResetPasswordPage from "../pages/ShowResetPasswordPage.vue";
import EmailVerificationPage from "../pages/EmailVerificationPage.vue";
import PublicHomePage from "../pages/PublicHomePage.vue";
import PlaceholderPage from "../pages/PlaceholderPage.vue";
import ManageUsersPage from "../pages/ManageUsersPage.vue";
import ManageDomainPage from "../pages/ManageDomainPage.vue";
import ManageDomainFormPage from "../pages/ManageDomainFormPage.vue";
import ManageRolesPage from "../pages/ManageRolesPage.vue";
import RoleFormPage from "../pages/RoleFormPage.vue";
import { ACCESS_TOKEN_NAME } from "../constants/apiConstants";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/public", component: PublicHomePage, meta: { title: "Public Home" } },
  { path: "/register", component: RegisterPage, meta: { title: "Register" } },
  { path: "/login", component: LoginPage, meta: { title: "Login" } },
  { path: "/reset-password", component: ResetPasswordPage, meta: { title: "Reset Password" } },
  { path: "/submitresetpassword", component: ShowResetPasswordPage, meta: { title: "Set New Password" } },
  { path: "/verifyemail", component: EmailVerificationPage, meta: { title: "Email Verification" } },

  // Private routes
  { path: "/home", component: PlaceholderPage, meta: { title: "Home", requiresAuth: true } },
  { path: "/my-profile", component: PlaceholderPage, meta: { title: "My Profile", requiresAuth: true } },
  { path: "/revenue-report", component: PlaceholderPage, meta: { title: "Revenue Report", requiresAuth: true } },
  { path: "/manage-users", component: ManageUsersPage, meta: { title: "Manage Users", requiresAuth: true } },
  { path: "/manage-domains", component: ManageDomainPage, meta: { title: "Manage Domains", requiresAuth: true } },
  { path: "/manage-domains/add", component: ManageDomainFormPage, meta: { title: "Add Domain", requiresAuth: true } },
  { path: "/manage-domains/edit", component: ManageDomainFormPage, meta: { title: "Edit Domain", requiresAuth: true } },
  { path: "/manage-roles", component: ManageRolesPage, meta: { title: "Manage Roles", requiresAuth: true } },
  { path: "/manage-roles/add", component: RoleFormPage, meta: { title: "Add Role", requiresAuth: true } },
  { path: "/manage-roles/edit", component: RoleFormPage, meta: { title: "Edit Role", requiresAuth: true } },
  { path: "/settings", component: PlaceholderPage, meta: { title: "Settings", requiresAuth: true } },
  { path: "/stl-viewer", component: PlaceholderPage, meta: { title: "STL Viewer", requiresAuth: true } },
  { path: "/video-photo", component: PlaceholderPage, meta: { title: "Video Photo", requiresAuth: true } },
  { path: "/pusher-chat", component: PlaceholderPage, meta: { title: "Pusher Chat", requiresAuth: true } },
  { path: "/timesheet", component: PlaceholderPage, meta: { title: "Timesheet", requiresAuth: true } },
  { path: "/document-bank", component: PlaceholderPage, meta: { title: "Document Bank", requiresAuth: true } },
  { path: "/cv-editor", component: PlaceholderPage, meta: { title: "CV Editor", requiresAuth: true } },
  { path: "/issue-tracker", component: PlaceholderPage, meta: { title: "Issue Tracker", requiresAuth: true } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem(ACCESS_TOKEN_NAME)) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;