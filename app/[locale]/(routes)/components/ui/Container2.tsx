import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import React from "react";

interface ContainerProps {
  title: string;
  description: string;
  visibility?: string;
  buttonText?: string;
  buttonHref?: string;
  buttonComponent?: React.ReactNode;
  children: React.ReactNode;
}

const Container = ({
  title,
  description,
  visibility,
  buttonText,
  buttonHref,
  buttonComponent,
  children,
}: ContainerProps) => {
  return (
    <div className="flex flex-col flex-1 h-full w-full">
      <div className="flex justify-between items-center">
        <Heading
          title={title}
          description={description}
          visibility={visibility}
        />
        {buttonComponent ? (
          buttonComponent
        ) : (
          buttonText && buttonHref && (
            <Link
              href={buttonHref ? buttonHref : "#"}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors"
            >
              {buttonText}
            </Link>
          )
        )}
      </div>
      <Separator className="my-4" />
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
};

export default Container;
