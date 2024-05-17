import { cn } from "@demo/utils";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import { HTMLAttributes, useEffect } from "react";

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  onClick: () => void;
  title: string;
  disabled?: boolean;
};

export const Button = ({
  onClick,
  title,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  const { ref, focused, focusSelf } = useFocusable({ onEnterPress: onClick });
  useEffect(() => {
    focusSelf();
  }, [focusSelf]);
  return (
    <button
      ref={ref}
      className={cn(
        "m-2 rounded-md border-2 border-green-900 px-2 py-1 text-white",
        disabled && "bg-gray-800",
        focused && " border-yellow-500 bg-green-700",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {title}
    </button>
  );
};
