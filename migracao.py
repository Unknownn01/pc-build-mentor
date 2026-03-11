import csv
import sqlite3
import os

# --- CONFIGURAÇÃO ---
DB_FILE = os.path.join('backend', 'hardware.db')
CSV_FOLDER = 'backend'
# --------------------

# --- FUNÇÕES AUXILIARES ---
def safe_converter(value, target_type):
    if value is None or value.strip().upper() in ('N/A', ''):
        return None
    try:
        # Substitui vírgula por ponto para preços/números decimais
        if target_type in (float, int) and isinstance(value, str):
            value = value.replace(',', '.')
        return target_type(value)
    except (ValueError, TypeError):
        return None

def execute_migration(conn, create_sql, insert_sql, csv_filename, column_types):
    component_name = csv_filename.replace('.csv', '').replace('_', ' ').capitalize()
    print(f"\nIniciando migração de: {component_name}...")
    cursor = conn.cursor()
    cursor.execute(create_sql)
    csv_path = os.path.join(CSV_FOLDER, csv_filename)
    try:
        with open(csv_path, 'r', newline='', encoding='utf-8') as f:
            leitor = csv.reader(f)
            next(leitor)
            for linha in leitor:
                converted_row = [safe_converter(linha[i], target_type) for i, target_type in enumerate(column_types)]
                cursor.execute(insert_sql, converted_row)
        print(f"{component_name} migrados com sucesso!")
    except Exception as e:
        print(f"ERRO durante a migração de {component_name}: {e}")

# --- BLOCO PRINCIPAL DE EXECUÇÃO ---
if __name__ == '__main__':
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print("Banco de dados antigo removido para uma migração limpa.")

    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")

    # Lista COMPLETA de todos os componentes de HARDWARE a serem migrados
    hardware_components = [
        (
            '''CREATE TABLE IF NOT EXISTS processadores (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, marca TEXT, soquete TEXT, nucleos INTEGER, tdp_w INTEGER, ano_lancamento INTEGER, clock_base_ghz REAL, power_score INTEGER, imagem_url TEXT, preco_simulado REAL)''',
            '''INSERT INTO processadores VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
            'processadores.csv',
            (int, str, str, str, int, int, int, float, int, str, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS placas_de_video (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, marca TEXT, vram_gb INTEGER, tdp_w INTEGER, ano_lancamento INTEGER, clock_boost_mhz INTEGER, power_score INTEGER, imagem_url TEXT, preco_simulado REAL)''',
            '''INSERT INTO placas_de_video VALUES (?,?,?,?,?,?,?,?,?,?)''',
            'placas_de_video.csv',
            (int, str, str, int, int, int, int, int, str, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS placas_mae (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, soquete_cpu TEXT, tipo_ram TEXT, formato TEXT, plataforma TEXT, ano_lancamento INTEGER, slots_ram INTEGER, slots_m2 INTEGER, dissipacao_vrm TEXT, slots_pcie INTEGER, imagem_url TEXT, preco_simulado REAL)''',
            '''INSERT INTO placas_mae VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            'placas_mae.csv',
            (int, str, str, str, str, str, int, int, int, str, int, str, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS memorias_ram (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, tipo TEXT, capacidade_gb INTEGER, modulos INTEGER, frequencia_mhz INTEGER, preco_simulado REAL)''',
            '''INSERT INTO memorias_ram VALUES (?,?,?,?,?,?,?)''',
            'memorias_ram.csv',
            (int, str, str, int, int, int, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS armazenamento (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, tipo TEXT, capacidade_gb INTEGER, preco_simulado REAL)''',
            '''INSERT INTO armazenamento VALUES (?,?,?,?,?)''',
            'armazenamento.csv',
            (int, str, str, int, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS fontes_alimentacao (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, potencia_w INTEGER, certificacao TEXT, formato TEXT, preco_simulado REAL)''',
            '''INSERT INTO fontes_alimentacao VALUES (?,?,?,?,?,?)''',
            'fontes_alimentacao.csv',
            (int, str, int, str, str, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS gabinetes (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, formato TEXT, formatos_placa_mae_suportados TEXT, max_gpu_length_mm INTEGER, max_cooler_height_mm INTEGER, preco_simulado REAL)''',
            '''INSERT INTO gabinetes VALUES (?,?,?,?,?,?,?)''',
            'gabinetes.csv',
            (int, str, str, str, int, int, float)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS refrigeracao (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, tipo TEXT, soquetes_suportados TEXT, altura_mm INTEGER, tamanho_radiador_mm TEXT, preco_simulado REAL)''',
            '''INSERT INTO refrigeracao VALUES (?,?,?,?,?,?,?)''',
            'refrigeracao.csv',
            (int, str, str, str, int, str, float)
        )
    ]

    # Lista de todos os dados da APLICAÇÃO a serem migrados
    application_data = [
        (
            '''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL)''',
            '''INSERT INTO users VALUES (?,?,?,?)''',
            'Users.csv',
            (int, str, str, str)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS builds (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, uso_principal TEXT, cpu_id INTEGER, gpu_id INTEGER, memoria_id INTEGER, placamae_id INTEGER, armazenamento_id INTEGER, cooler_id INTEGER, gabinete_id INTEGER, fonte_id INTEGER, imagem_url TEXT)''',
            '''INSERT INTO builds VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
            'Builds.csv',
            (int, str, str, int, int, int, int, int, int, int, int, str)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS saved_builds (id INTEGER PRIMARY KEY, user_id INTEGER, build_name TEXT, build_data TEXT, FOREIGN KEY (user_id) REFERENCES users (id))''',
            '''INSERT INTO saved_builds VALUES (?,?,?,?)''',
            'saved_builds.csv',
            (int, int, str, str)
        ),
        (
            '''CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id INTEGER, order_date TEXT, total_price REAL, assembly_choice TEXT, shipping_address TEXT, items TEXT, FOREIGN KEY (user_id) REFERENCES users (id))''',
            '''INSERT INTO orders VALUES (?,?,?,?,?,?,?)''',
            'Orders.csv',
            (str, int, str, float, str, str, str)
        )
    ]
    
    print("--- INICIANDO MIGRAÇÃO DE HARDWARE ---")
    for create_sql, insert_sql, csv_filename, types in hardware_components:
        execute_migration(conn, create_sql, insert_sql, csv_filename, types)
    
    print("\n--- INICIANDO MIGRAÇÃO DE DADOS DA APLICAÇÃO ---")
    for create_sql, insert_sql, csv_filename, types in application_data:
        execute_migration(conn, create_sql, insert_sql, csv_filename, types)

    conn.commit()
    conn.close()

    print("\n--- MIGRAÇÃO COMPLETA! O banco de dados 'backend/hardware.db' foi criado/atualizado com sucesso. ---")