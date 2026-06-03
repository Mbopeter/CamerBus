<?php
declare(strict_types=1);

class Validator
{
    public static function validate(array $data, array $rules): array
    {
        $errors = [];
        $validated = [];

        foreach ($rules as $field => $ruleString) {
            $value = $data[$field] ?? null;
            $ruleArray = explode('|', $ruleString);

            foreach ($ruleArray as $rule) {
                if ($rule === 'required' && (is_null($value) || $value === '')) {
                    $errors[$field][] = "The {$field} field is required.";
                }
                
                if (!is_null($value) && $value !== '') {
                    if ($rule === 'numeric' && !is_numeric($value)) {
                        $errors[$field][] = "The {$field} must be a number.";
                    }
                    if ($rule === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field][] = "The {$field} must be a valid email.";
                    }
                    if (str_starts_with($rule, 'min:')) {
                        $min = (int) explode(':', $rule)[1];
                        if (is_string($value) && strlen($value) < $min) {
                            $errors[$field][] = "The {$field} must be at least {$min} characters.";
                        } elseif (is_numeric($value) && $value < $min) {
                            $errors[$field][] = "The {$field} must be at least {$min}.";
                        }
                    }
                    if ($rule === 'array' && !is_array($value)) {
                        $errors[$field][] = "The {$field} must be an array.";
                    }
                }
            }

            if (!isset($errors[$field]) && isset($data[$field])) {
                $validated[$field] = $data[$field];
            }
        }

        if (!empty($errors)) {
            Response::error('Validation failed', 422, $errors);
        }

        // Merge validated fields back into the original data so non-validated
        // optional fields (e.g. company_id, branch_id) are preserved.
        return array_merge($data, $validated);
    }
}
