import { atom, useAtom } from "jotai";

import { Mail, mails } from "@/app/[locale]/(routes)/marketing/emails//data";

type Config = {
  selected: Mail["id"] | null;
  selectedTab: string; // Added selectedTab to track which tab is active
};

const configAtom = atom<Config>({
  selected: mails[0].id,
  selectedTab: 'inbox', // Default to inbox
});

export function useMail() {
  const [config, setConfig] = useAtom(configAtom);
  
  const setSelected = (id: Mail["id"] | null) => {
    setConfig(prev => ({ ...prev, selected: id }));
  };
  
  const setSelectedTab = (tab: string) => {
    setConfig(prev => ({ ...prev, selectedTab: tab }));
  };
  
  return {
    ...config,
    setSelected,
    setSelectedTab
  };
}