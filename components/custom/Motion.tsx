"use client";

import { motion, MotionProps } from "framer-motion";
import React from "react";

interface CustomMotionProps<Tag extends keyof HTMLElementTagNameMap>
  extends MotionProps {
  type?: Tag;
  children: React.ReactNode;
  className?: string | null;
}

export const Motion = <Tag extends keyof HTMLElementTagNameMap>({
  type,
  children,
  className,
  ...props
}: CustomMotionProps<Tag>) => {
  const Component = type ? (motion as Record<string, any>)[type as keyof typeof motion] : motion.div;
  return (
    <Component className={className || undefined} {...props}>
      {children}
    </Component>
  );
};