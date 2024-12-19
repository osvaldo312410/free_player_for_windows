import subprocess
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import requests
import json
import time
import pygetwindow as gw
import keyboard
from flask_caching import Cache

app = Flask(__name__)
app.secret_key = 'IQWYG¨#@$76e78trtwgdyuufgwyuguyNUWIHFf0-2=209'

# Configuração do cache
app.config['CACHE_TYPE'] = 'SimpleCache'  # Usando cache simples
app.config['CACHE_DEFAULT_TIMEOUT'] = 999999999  # Cache expira em 5 minutos
cache = Cache(app)

# Função para Obter as Categorias com Cache
@cache.cached(key_prefix='categorias')
def obter_categorias():
    with open("config.json", "r") as config_file:
        config = json.load(config_file)
        url = config.get("url", "")

    categorias = []

    if url:
        response = requests.get(url)
        conteudo = response.text
        linhas = conteudo.splitlines()

        for linha in linhas:
            if linha.startswith("#EXTINF:"):
                group_title = ""
                if 'group-title="' in linha:
                    group_title = linha.split('group-title="')[1].split('"')[0]

                if group_title and not any(categoria['group-title'] == group_title for categoria in categorias):
                    categorias.append({"group-title": group_title})

    return categorias

# Rota para buscar e filtrar os canais com Cache
@app.route('/obter_canais', methods=['GET'])
@cache.cached(query_string=True)  # Cache baseado nos parâmetros da query string
def obter_canais():
    categoria = request.args.get('categoria', '').lower()
    with open("config.json", "r") as config_file:
        config = json.load(config_file)
        url = config.get("url", "")

    canais = []

    if url:
        try:
            response = requests.get(url)
        except Exception as e:
            return jsonify({"error": f"Falha ao acessar a URL: {e}"}), 500

        conteudo = response.text
        linhas = conteudo.splitlines()

        for i, linha in enumerate(linhas):
            if linha.startswith("#EXTINF:"):
                group_title = ""
                if 'group-title="' in linha:
                    group_title = linha.split('group-title="')[1].split('"')[0]

                if categoria in group_title.lower():
                    nome = linha.split(",")[-1].strip()
                    url_stream = linhas[i + 1] if i + 1 < len(linhas) and not linhas[i + 1].startswith("#") else None

                    if url_stream:
                        logo = ""
                        if 'tvg-logo="' in linha:
                            logo = linha.split('tvg-logo="')[1].split('"')[0]

                        canais.append({
                            "nome": nome,
                            "logo": logo,
                            "url": url_stream
                        })

    print("Canais enviados para o frontend:", canais)
    return jsonify(canais)

# Rota para abrir o VLC com o link do canal
@app.route('/abrir_vlc', methods=['POST'])
def abrir_vlc():
    url = request.form.get("url")
    if url:
        try:
            vlc_path = r'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'
            subprocess.run([vlc_path, url], check=True)
            return "VLC aberto com o canal!"
        except subprocess.CalledProcessError as e:
            return f"Erro ao abrir o VLC: {str(e)}"
        except Exception as e:
            return f"Erro inesperado: {str(e)}"
    return "URL não fornecida!"

# Rota para a página inicial
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        nova_url = request.form.get("nova_url")
        if nova_url:
            try:
                with open("config.json", "r") as config_file:
                    config_data = json.load(config_file)
            except (FileNotFoundError, json.JSONDecodeError):
                config_data = {}

            config_data["url"] = nova_url

            with open("config.json", "w") as config_file:
                json.dump(config_data, config_file, indent=4)

            flash("URL atualizada com sucesso!", "success")
            return redirect(url_for("index"))
        else:
            flash("A URL não pode estar vazia.", "danger")

    categorias = obter_categorias()
    return render_template("index.html", categorias=categorias)

# Função para verificar o status do VLC
def check_vlc_status():
    try:
        for window in gw.getWindowsWithTitle('VLC'):
            if 'Paused' in window.title or 'Stopped' in window.title:
                keyboard.send('space')
    except Exception as e:
        print(f"Erro: {e}")

# Loop para verificar o status do VLC em segundo plano
def vlc_monitor():
    while True:
        check_vlc_status()
        time.sleep(1)

if __name__ == '__main__':
    import threading
    threading.Thread(target=vlc_monitor, daemon=True).start()
    app.run(debug=True, port=5003, threaded=True)
