# Script para configurar la base de datos PostgreSQL
# Ejecutar como usuario postgres: psql -f setup_database.sql

-- Crear base de datos para SmartSelling
CREATE DATABASE smartselling_test;

-- Crear usuario para la aplicación
CREATE USER smartselling WITH PASSWORD 'df5g42645381a2';

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE smartselling_test TO smartselling;
GRANT CONNECT ON DATABASE smartselling_test TO smartselling;
GRANT USAGE ON SCHEMA public TO smartselling;
GRANT CREATE ON SCHEMA public TO smartselling;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smartselling;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smartselling;

-- Alternativamente, hacer al usuario propietario de la base
ALTER DATABASE smartselling_test OWNER TO smartselling;

-- Permitir al usuario crear bases de datos (para testing)
ALTER USER smartselling CREATEDB;

-- Mostrar información
\l
\du
