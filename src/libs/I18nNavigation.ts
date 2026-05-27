import { createNavigation } from "next-intl/navigation";
import { routing } from "./I18nRouting";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
