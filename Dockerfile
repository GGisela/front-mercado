# Usamos Nginx directamente
FROM nginx:stable-alpine

# Copiamos la carpeta dist que ya tienes en tu escritorio al contenedor
COPY dist /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]