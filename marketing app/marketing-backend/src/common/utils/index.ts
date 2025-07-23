import * as crypto from 'crypto';

export function parseId(id: string): number {
  const parsed = Number(id);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid ID: ${id}`);
  }
  return parsed;
}

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export function getPagination(query: PaginationQuery) {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '10', 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
