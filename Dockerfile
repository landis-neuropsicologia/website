# Dockerfile para site estático
FROM nginx:alpine

# Remover arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar o arquivo index.html
COPY index.html /usr/share/nginx/html/

# Copiar todos os arquivos do diretório assets (incluindo subdiretorios)
COPY assets/ /usr/share/nginx/html/assets/

# Verificar se a pasta images existe e copiar separadamente se necessário
COPY assets/images/ /usr/share/nginx/html/assets/images/

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]