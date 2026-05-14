-- SCRIPT DE CRÉATION DES TABLES POUR SUPABASE (SQL EDITOR)
-- Copiez ce contenu et collez-le dans l'onglet "SQL Editor" de Supabase, puis cliquez sur "Run".

-- 1. Création des types énumérés
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('OWNER', 'TRAINER', 'STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Création de la table Profile
CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "minecraftName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- 3. Création de la table Session
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- 4. Création de la table Application
CREATE TABLE IF NOT EXISTS "Application" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- 5. Création de la table Resource
CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- 6. Ajout des clés étrangères (Foreign Keys)
-- On vérifie si elles existent déjà pour éviter les erreurs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_trainerId_fkey') THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_studentId_fkey') THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
