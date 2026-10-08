import request from 'supertest';
import express, { Express } from 'express';
import { Router } from 'express';

// ---- Mocks ----
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({insert: mockInsert}));
jdest.mock(utils/supabase',()=>({
  createClient: () => ({from: mockFrom}),
}));
