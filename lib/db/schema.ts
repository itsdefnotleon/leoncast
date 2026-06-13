import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// ---------- Better Auth tables ----------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('dj'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// ---------- App tables ----------

export const station = pgTable('station', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  shortcode: text('shortcode').notNull(),
  description: text('description'),
  genre: text('genre'),
  frequency: text('frequency'),
  isPublic: boolean('isPublic').notNull().default(true),
  isEnabled: boolean('isEnabled').notNull().default(true),
  listeners: integer('listeners').notNull().default(0),
  peakListeners: integer('peakListeners').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  stationId: integer('stationId'),
  title: text('title').notNull(),
  artist: text('artist'),
  album: text('album'),
  genre: text('genre'),
  duration: integer('duration').notNull().default(0),
  url: text('url').notNull(),
  fileSize: integer('fileSize').notNull().default(0),
  playCount: integer('playCount').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const playlist = pgTable('playlist', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  stationId: integer('stationId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull().default('general'),
  playMode: text('playMode').notNull().default('shuffle'),
  weight: integer('weight').notNull().default(3),
  isEnabled: boolean('isEnabled').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const playlistTrack = pgTable('playlist_track', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  playlistId: integer('playlistId').notNull(),
  mediaId: integer('mediaId').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const schedule = pgTable('schedule', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  stationId: integer('stationId').notNull(),
  playlistId: integer('playlistId').notNull(),
  title: text('title').notNull(),
  dayOfWeek: integer('dayOfWeek').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  isEnabled: boolean('isEnabled').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
