"use client";

import type { HTMLAttributes, ReactNode } from "react";

type MessageRole = "assistant" | "user" | "system" | "data" | "tool";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: MessageRole;
};

export function Message({ className, from, ...props }: MessageProps) {
  return (
    <div
      className={cx(
        "group flex w-full max-w-[95%] flex-col gap-2",
        from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
        className
      )}
      data-role={from}
      {...props}
    />
  );
}

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export function MessageContent({ children, className, ...props }: MessageContentProps) {
  return (
    <div className={cx("min-w-0 whitespace-pre-wrap break-words", className)} {...props}>
      {children}
    </div>
  );
}

export type MessageResponseProps = {
  children: ReactNode;
  className?: string;
};

export function MessageResponse({ children, className }: MessageResponseProps) {
  return <div className={cx("min-w-0 whitespace-pre-wrap break-words", className)}>{children}</div>;
}
