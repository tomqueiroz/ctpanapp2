import { CheckCircle2, Circle } from "lucide-react";
import { getPasswordRequirements } from "@/lib/password-policy";

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="grid grid-cols-1 gap-1 text-xs text-gray-600 sm:grid-cols-2">
      {getPasswordRequirements(password).map((requirement) => (
        <li
          key={requirement.label}
          className={`flex items-center gap-1.5 ${requirement.met ? "text-green-700" : ""}`}
        >
          {requirement.met ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
          {requirement.label}
        </li>
      ))}
    </ul>
  );
}

