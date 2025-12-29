"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
exports.validateVehicleInput = validateVehicleInput;
exports.validateVehicleInputOrThrow = validateVehicleInputOrThrow;
exports.validateInquiryInput = validateInquiryInput;
exports.validateInquiryInputOrThrow = validateInquiryInputOrThrow;
class ValidationException extends Error {
    constructor(errors) {
        super('Validation failed');
        this.errors = errors;
        this.name = 'ValidationException';
    }
}
exports.ValidationException = ValidationException;
/**
 * Validate vehicle data according to requirements
 * Requirements: 1.2, 9.1
 */
function validateVehicleInput(data) {
    const errors = [];
    const currentYear = new Date().getFullYear();
    // Year validation: Must be between 1990 and current year + 1
    if (data.year < 1990) {
        errors.push({
            field: 'year',
            message: `Year must be between 1990 and ${currentYear + 1}`
        });
    }
    if (data.year > currentYear + 1) {
        errors.push({
            field: 'year',
            message: `Year must be between 1990 and ${currentYear + 1}`
        });
    }
    // Price validation: Must be > 0
    if (data.price <= 0) {
        errors.push({
            field: 'price',
            message: 'Price must be greater than 0'
        });
    }
    // Mileage validation: Must be >= 0
    if (data.mileage < 0) {
        errors.push({
            field: 'mileage',
            message: 'Mileage must be greater than or equal to 0'
        });
    }
    // Required field validations
    if (!data.make || data.make.trim().length === 0) {
        errors.push({
            field: 'make',
            message: 'Make is required'
        });
    }
    if (data.make && data.make.length > 100) {
        errors.push({
            field: 'make',
            message: 'Make must not exceed 100 characters'
        });
    }
    if (!data.model || data.model.trim().length === 0) {
        errors.push({
            field: 'model',
            message: 'Model is required'
        });
    }
    if (data.model && data.model.length > 100) {
        errors.push({
            field: 'model',
            message: 'Model must not exceed 100 characters'
        });
    }
    // Description length validation
    if (data.descriptionJa && data.descriptionJa.length > 2000) {
        errors.push({
            field: 'descriptionJa',
            message: 'Japanese description must not exceed 2000 characters'
        });
    }
    if (data.descriptionEn && data.descriptionEn.length > 2000) {
        errors.push({
            field: 'descriptionEn',
            message: 'English description must not exceed 2000 characters'
        });
    }
    return errors;
}
/**
 * Validate and throw if validation fails
 */
function validateVehicleInputOrThrow(data) {
    const errors = validateVehicleInput(data);
    if (errors.length > 0) {
        throw new ValidationException(errors);
    }
}
/**
 * Validate inquiry data according to requirements
 * Requirements: 4.2, 4.3
 */
function validateInquiryInput(data) {
    const errors = [];
    // Customer name validation: Required, max 100 characters
    if (!data.customerName || data.customerName.trim().length === 0) {
        errors.push({
            field: 'customerName',
            message: 'Customer name is required'
        });
    }
    if (data.customerName && data.customerName.length > 100) {
        errors.push({
            field: 'customerName',
            message: 'Customer name must not exceed 100 characters'
        });
    }
    // Email or Phone: At least one required
    const hasEmail = data.customerEmail && data.customerEmail.trim().length > 0;
    const hasPhone = data.customerPhone && data.customerPhone.trim().length > 0;
    if (!hasEmail && !hasPhone) {
        errors.push({
            field: 'customerEmail',
            message: 'Either email or phone number is required'
        });
        errors.push({
            field: 'customerPhone',
            message: 'Either email or phone number is required'
        });
    }
    // Email format validation (if provided)
    if (hasEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.customerEmail)) {
            errors.push({
                field: 'customerEmail',
                message: 'Invalid email format'
            });
        }
    }
    // Message validation: Required, max 1000 characters
    if (!data.message || data.message.trim().length === 0) {
        errors.push({
            field: 'message',
            message: 'Message is required'
        });
    }
    if (data.message && data.message.length > 1000) {
        errors.push({
            field: 'message',
            message: 'Message must not exceed 1000 characters'
        });
    }
    // Vehicle ID validation: Must be positive
    if (!data.vehicleId || data.vehicleId <= 0) {
        errors.push({
            field: 'vehicleId',
            message: 'Valid vehicle ID is required'
        });
    }
    // Inquiry type validation
    const validTypes = ['phone', 'email', 'line'];
    if (!validTypes.includes(data.inquiryType)) {
        errors.push({
            field: 'inquiryType',
            message: 'Inquiry type must be one of: phone, email, line'
        });
    }
    return errors;
}
/**
 * Validate and throw if validation fails
 */
function validateInquiryInputOrThrow(data) {
    const errors = validateInquiryInput(data);
    if (errors.length > 0) {
        throw new ValidationException(errors);
    }
}
