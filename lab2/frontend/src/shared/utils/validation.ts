
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавную букву');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчную букву');
  }

  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать цифру');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCoordinates(x: number, y: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (x < 0 || x > 109) {
    errors.push('Координата X должна быть от 0 до 109');
  }

  if (!Number.isFinite(y)) {
    errors.push('Координата Y должна быть числом');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePositiveNumber(value: number, fieldName: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Number.isFinite(value)) {
    errors.push(`${fieldName} должно быть числом`);
  } else if (value <= 0) {
    errors.push(`${fieldName} должно быть больше 0`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStringLength(value: string, maxLength: number, fieldName: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (value.length > maxLength) {
    errors.push(`${fieldName} не должно превышать ${maxLength} символов`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
