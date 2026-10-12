"use client";

import { useSettingsPage } from "@/hooks/pages/useSettingsPage";
import { SettingsView } from "./SettingsView";

export function Settings() {
  return <SettingsView page={useSettingsPage()} />;
}
