"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import fetcher from "@/lib/fetcher";
import useDebounce from "@/hooks/useDebounce";

type Template = { id: string; title: string };

interface TemplateSearchComboboxProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  initialTemplates?: Template[];
}

const PAGE_SIZE = 50;

export function TemplateSearchCombobox({
  value,
  onChange,
  placeholder = "Select template",
  disabled,
  name,
  initialTemplates,
}: TemplateSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [accumulated, setAccumulated] = useState<Template[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const listUrl = open
    ? `/api/marketing/templates?search=${encodeURIComponent(
        debouncedSearch
      )}&skip=${skip}&take=${PAGE_SIZE}`
    : null;

  const { data: listData, isLoading } = useSWR(listUrl, fetcher);

  const selectedInList = accumulated.find((t) => t.id === value);
  const { data: single } = useSWR(
    value && !selectedInList ? `/api/marketing/templates/${value}` : null,
    fetcher
  );

  useEffect(() => {
    const templates = Array.isArray(listData)
      ? listData
      : listData?.templates ?? [];

    if (templates.length) {
      if (skip === 0) {
        setAccumulated(templates);
      } else {
        setAccumulated((prev) => [...prev, ...templates]);
      }
    }
  }, [listData, skip]);

  useEffect(() => {
    setSkip(0);
    setAccumulated([]);
  }, [debouncedSearch]);

  // initialize with server-provided templates when available
  useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) {
      setAccumulated(initialTemplates);
    }
  }, [initialTemplates]);

  const display = selectedInList ?? single ?? null;

  const handleSelect = (id: string) => {
    onChange(id === value ? "" : id);
    setOpen(false);
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
            type="button"
          >
            <span className="truncate text-sm">
              {display?.title ?? (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search templates..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList onWheelCapture={(e) => e.stopPropagation()}>
              {isLoading && skip === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <>
                  <CommandEmpty>No templates found.</CommandEmpty>
                  <CommandGroup>
                    {accumulated.map((t) => (
                      <CommandItem
                        key={t.id}
                        value={t.id}
                        onSelect={handleSelect}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === t.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {t.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {listData?.hasMore && (
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        className="w-full text-sm"
                        type="button"
                        onClick={() => setSkip((prev) => prev + PAGE_SIZE)}
                        disabled={isLoading}
                      >
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
