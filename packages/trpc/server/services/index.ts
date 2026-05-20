import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import ResponseService from "@repo/services/response";
import AnalyticsService from "@repo/services/analytics";
import ThemeService from "@repo/services/theme";
import ExploreService from "@repo/services/explore";

export const userService = new UserService();
export const formService = new FormService();
export const responseService = new ResponseService();
export const analyticsService = new AnalyticsService();
export const themeService = new ThemeService();
export const exploreService = new ExploreService();
