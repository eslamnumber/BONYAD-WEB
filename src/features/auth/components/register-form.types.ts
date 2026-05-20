export type RegisterFormLabels = {
  nameLabel: string;
  namePlaceholder: string;
  nameAriaLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneAriaLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordAriaLabel: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  confirmPasswordAriaLabel: string;
  togglePasswordVisibility: string;
  termsText: string;
  termsAriaLabel: string;
  submitButton: string;
  hints: {
    phoneFormat: string;
    nameFormat: string;
    passwordConfirm: string;
  };
  errors: {
    nameRequired: string;
    nameTooShort: string;
    phoneRequired: string;
    phoneInvalid: string;
    passwordRequired: string;
    passwordTooShort: string;
    confirmPasswordRequired: string;
    passwordMismatch: string;
    phoneAlreadyRegistered: string;
    genericError: string;
  };
};
