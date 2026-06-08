import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const variantClass = {
  default: "ui-button-default",
  outline: "ui-button-outline",
  ghost: "ui-button-ghost",
  secondary: "ui-button-secondary",
  destructive: "ui-button-destructive",
  link: "ui-button-link",
};

const sizeClass = {
  default: "ui-button-md",
  sm: "ui-button-sm",
  lg: "ui-button-lg",
  icon: "ui-button-icon",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "ui-button",
          variantClass[variant] || variantClass.default,
          sizeClass[size] || sizeClass.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
