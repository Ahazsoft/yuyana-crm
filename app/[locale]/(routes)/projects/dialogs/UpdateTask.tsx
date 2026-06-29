"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { UserSearchCombobox } from "@/components/ui/user-search-combobox";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type UpdateTaskDialogProps = {
  initialData: any;
  onDone?: () => void;
};

const UpdateTaskDialog = ({ initialData, onDone }: UpdateTaskDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const initialAssignedUserId =
    initialData?.user ?? initialData?.assigned_user?.id ?? "";
  const initialAssignedUserName = initialData?.assigned_user?.name ?? "";

  const formSchema = z.object({
    title: z.string().min(3).max(255),
    user: z.string().min(3),
    dueDateAt: z.date(),
    priority: z.string().min(3).max(10),
    content: z.string().min(3).max(500),
  });

  type UpdatedTaskForm = z.infer<typeof formSchema>;

  const defaultValues = {
    title: initialData?.title || "",
    user: initialAssignedUserId,
    dueDateAt: initialData?.dueDateAt
      ? new Date(initialData.dueDateAt)
      : new Date(),
    priority: initialData?.priority || "medium",
    content: initialData?.content || initialData?.description,
  };

  const form = useForm<UpdatedTaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setIsMounted(true);
  }, [initialData?.id]);

  if (!isMounted) {
    return null;
  }

  //Actions
  // console.log("BoardId:", boardId);
  // console.log("initial Data:", initialData);

  const onSubmit = async (data: UpdatedTaskForm) => {
    setIsLoading(true);
    try {
      await axios.put(
        `/api/projects/tasks/update-task/${initialData.id}`,
        data,
      );
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      onDone && onDone();
      router.refresh();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.response?.data || "Failed to update task. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
      .join(", ");

    toast({
      variant: "destructive",
      title: "Form validation failed",
      description: errorMessages || "Please check all required fields.",
    });
  };

  return (
    <div className="flex flex-col space-y-2 w-full ">
      {/* <pre>
        <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
      </pre> */}
        {/* <code>{JSON.stringify(initialData)}</code> */}
      {/* <div>
        <pre>
          {JSON.stringify(
            {
              boards,
            },
            null,
            2
          )}
        </pre>
      </div> */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="h-full w-full space-y-3"
        >
          <div className="flex flex-col space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title {/* {initialData.id} */}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter task name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Enter task description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDateAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a expected close date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        //@ts-ignore
                        //TODO: fix this
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned to</FormLabel>
                  <FormControl>
                    <UserSearchCombobox
                      value={field.value ?? initialAssignedUserId}
                      onChange={field.onChange}
                      placeholder="Select assigned user"
                      disabled={isLoading}
                      selectedUserName={initialAssignedUserName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose task priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tasks priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full justify-end space-x-2 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="animate-spin" />
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateTaskDialog;
