import { cn } from "@demo/utils";

type ButtonProps = {
  onClick: () => void;
  title: string;
  disabled?: boolean;
};

export const Button = ({ onClick, title, disabled }: ButtonProps) => {
  return (
    <div className="mt-2 flex flex-col items-start gap-2">
      <button
        className={cn("rounded-md bg-blue-400 p-1", disabled && "bg-gray-400")}
        onClick={onClick}
        disabled={disabled}
      >
        {title}
      </button>
    </div>
  );
};
