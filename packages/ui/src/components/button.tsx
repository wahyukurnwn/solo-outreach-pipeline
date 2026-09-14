interface ButtonProps {
  label: string;
  type: "submit" | "button" | "reset";
  isPending: boolean;
}

export const Button = ({ type, label, isPending }: ButtonProps) => {
  return (
    <button type={type} disabled={isPending}>
      {label}
    </button>
  );
};
