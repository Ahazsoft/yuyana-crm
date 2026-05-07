import { atom, useAtom } from "jotai";

type Config = {
  selected: string | null;
  selectedTab: string; // which tab is active
};

const configAtom = atom<Config>({
  selected: null,
  selectedTab: "inbox",
});

export function useMail() {
  const [config, setConfig] = useAtom(configAtom);

  const setSelected = (id: string | null) => {
    setConfig((prev) => ({ ...prev, selected: id }));
  };

  const setSelectedTab = (tab: string) => {
    setConfig((prev) => ({ ...prev, selectedTab: tab }));
  };

  return {
    ...config,
    setSelected,
    setSelectedTab,
  };
}