export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      label: "Uma letra maiúscula",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Uma letra minúscula",
      met: /[a-z]/.test(password),
    },
    {
      label: "Um número",
      met: /\d/.test(password),
    },
    {
      label: "Um caractere especial",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function isStrongPassword(password: string): boolean {
  return getPasswordRequirements(password).every((requirement) => requirement.met);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

