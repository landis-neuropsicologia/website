# Dockerfile
# Multi-stage build: build stage + production stage

# ===== BUILD STAGE =====
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY pack*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar SCSS para CSS
# RUN npm run build-css

# ===== PRODUCTION STAGE =====
FROM nginx:alpine

# Remover configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar arquivos do site (HTML, CSS, JS)
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/css/ /usr/share/nginx/html/css/
COPY --from=builder /app/js/ /usr/share/nginx/html/js/
COPY --from=builder /app/assets/ /usr/share/nginx/html/assets/

# Copiar configuração customizada do nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
